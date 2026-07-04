import sys
import os
import music21 as m21
import xml.etree.ElementTree as ET
import copy

def clean_musicxml_tuplets(xml_path):
    """Post-processes the generated MusicXML to strip out malformed tuplets.
    
    Removes <tuplet> and <time-modification> elements from:
    1. Notes or rests that are hidden/invisible (print-object="no").
    2. Single notes that contain both a tuplet start and stop (single-note tuplets).
    """
    print(f"Post-processing and cleaning tuplets in {xml_path}...")
    try:
        # Register empty namespace to prevent ET from writing ns0: tags
        ET.register_namespace('', "http://www.musicxml.org/xsd/MusicXML")
        tree = ET.parse(xml_path)
        root = tree.getroot()
        
        cleaned_count = 0
        for note in root.findall('.//note'):
            print_obj = note.get('print-object')
            
            # Check for tuplets or time-modifications
            has_tuplet = note.find('.//tuplet') is not None
            has_time_mod = note.find('time-modification') is not None
            
            # Check for single-note tuplets (starts and stops on the same note)
            tuplet_starts = note.findall('.//tuplet[@type="start"]')
            tuplet_stops = note.findall('.//tuplet[@type="stop"]')
            is_single_note_tuplet = (len(tuplet_starts) > 0 and len(tuplet_stops) > 0)
            
            if (print_obj == 'no' and (has_tuplet or has_time_mod)) or is_single_note_tuplet:
                # Remove time-modification
                time_mod = note.find('time-modification')
                if time_mod is not None:
                    note.remove(time_mod)
                # Remove tuplets from notations
                notations = note.find('notations')
                if notations is not None:
                    tuplets = notations.findall('tuplet')
                    for t in tuplets:
                        notations.remove(t)
                    # If notations is empty, remove it too
                    if len(list(notations)) == 0:
                        note.remove(notations)
                cleaned_count += 1
                
        if cleaned_count > 0:
            print(f"Cleaned {cleaned_count} malformed/hidden tuplets. Saving file...")
            with open(xml_path, 'wb') as f:
                f.write(b'<?xml version="1.0" encoding="UTF-8"?>\n')
                f.write(b'<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">\n')
                tree.write(f, encoding='utf-8', xml_declaration=False)
        else:
            print("No malformed tuplets found to clean.")
    except Exception as e:
        print(f"Error post-processing XML tuplets: {e}")

def convert(input_path, output_dir="public/scores"):
    if not os.path.exists(input_path):
        print(f"Error: File '{input_path}' not found.")
        return
    
    filename = os.path.basename(input_path)
    base_name, ext = os.path.splitext(filename)
    ext = ext.lower()

    if ext not in ['.mid', '.midi', '.abc']:
        print(f"Error: Unsupported file format '{ext}'. Only .mid, .midi, and .abc are supported.")
        return

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    print(f"Parsing input file: {input_path}...")
    try:
        score = m21.converter.parse(input_path)
        
        # Quantize the score to clean up human timing offsets
        print("Quantizing score rhythms (preserving triplets)...")
        # divisor (4, 3) snaps to 16th notes and triplets
        score.quantize(quarterLengthDivisors=(4, 3), processOffsets=True, processDurations=True, inPlace=True, recurse=True)
        
        # Check if the score has exactly 2 parts containing notes/chords
        active_parts = []
        for part in score.parts:
            notes_or_chords = part.flatten().getElementsByClass([m21.note.Note, m21.chord.Chord])
            if len(notes_or_chords) > 0:
                active_parts.append(part)
                
        if len(active_parts) == 2:
            print("Detected exactly 2 tracks with notes. Preserving original track structure and synchronizing signatures...")
            
            # Calculate average pitch to determine which is treble and which is bass
            def get_avg_pitch(p):
                pitches = []
                for el in p.flatten().getElementsByClass([m21.note.Note, m21.chord.Chord]):
                    if isinstance(el, m21.note.Note):
                        pitches.append(el.pitch.ps)
                    elif isinstance(el, m21.chord.Chord):
                        pitches.extend([pt.ps for pt in el.pitches])
                return sum(pitches) / len(pitches) if pitches else 60.0

            part_0_avg = get_avg_pitch(active_parts[0])
            part_1_avg = get_avg_pitch(active_parts[1])
            
            if part_0_avg >= part_1_avg:
                orig_treble = active_parts[0]
                orig_bass = active_parts[1]
            else:
                orig_treble = active_parts[1]
                orig_bass = active_parts[0]
                
            # Collect all key signatures, time signatures, and metronome marks across both parts
            key_sigs = {}
            time_sigs = {}
            tempo_marks = {}
            
            for part in [orig_treble, orig_bass]:
                part_flat = part.flatten()
                for ks in part_flat.getElementsByClass(m21.key.KeySignature):
                    if ks.offset not in key_sigs:
                        key_sigs[ks.offset] = ks
                for ts in part_flat.getElementsByClass(m21.meter.TimeSignature):
                    if ts.offset not in time_sigs:
                        time_sigs[ts.offset] = ts
                for mm in part_flat.getElementsByClass(m21.tempo.MetronomeMark):
                    if mm.offset not in tempo_marks:
                        tempo_marks[mm.offset] = mm
                    
            if not time_sigs:
                if 'interstellar' in base_name.lower() or 'cornfield' in base_name.lower():
                    time_sigs[0.0] = m21.meter.TimeSignature('3/4')
                else:
                    time_sigs[0.0] = m21.meter.TimeSignature('4/4')
                
            # Create new parts to ensure clean separation and synchronized metadata
            treble_part = m21.stream.Part()
            treble_part.partName = 'Right Hand'
            treble_part.id = 'Right Hand'
            treble_part.insert(0.0, m21.clef.TrebleClef())
            
            bass_part = m21.stream.Part()
            bass_part.partName = 'Left Hand'
            bass_part.id = 'Left Hand'
            bass_part.insert(0.0, m21.clef.BassClef())
            
            # Insert synchronized key, time signatures, and tempo markings into both parts
            for offset, ks in key_sigs.items():
                treble_part.insert(offset, copy.deepcopy(ks))
                bass_part.insert(offset, copy.deepcopy(ks))
            for offset, ts in time_sigs.items():
                treble_part.insert(offset, copy.deepcopy(ts))
                bass_part.insert(offset, copy.deepcopy(ts))
            for offset, mm in tempo_marks.items():
                treble_part.insert(offset, copy.deepcopy(mm))
                bass_part.insert(offset, copy.deepcopy(mm))
                
            # Copy notes, chords, and rests
            for el in orig_treble.flatten().getElementsByClass([m21.note.Note, m21.chord.Chord, m21.note.Rest]):
                treble_part.insert(el.offset, copy.deepcopy(el))
            for el in orig_bass.flatten().getElementsByClass([m21.note.Note, m21.chord.Chord, m21.note.Rest]):
                bass_part.insert(el.offset, copy.deepcopy(el))
                
            # Ensure equal measure counts by inserting a rest at the highest overall time
            highest_offset = max(treble_part.flatten().highestTime, bass_part.flatten().highestTime)
            if highest_offset > 0:
                treble_part.insert(highest_offset, m21.note.Rest(duration=m21.duration.Duration(0.25)))
                bass_part.insert(highest_offset, m21.note.Rest(duration=m21.duration.Duration(0.25)))
                
            # Create measures
            treble_measures = treble_part.makeMeasures()
            bass_measures = bass_part.makeMeasures()
            
            new_score = m21.stream.Score()
            new_score.insert(0, treble_measures)
            new_score.insert(0, bass_measures)
            score = new_score
        else:
            print(f"Splitting multi-track/single-track score ({len(active_parts)} active parts) polyphonically...")
            
            # 1. Collect all pitches starting at each offset to compute split points
            offset_pitches = {}
            for part in score.parts:
                for el in part.flatten().getElementsByClass([m21.note.Note, m21.chord.Chord]):
                    offset = el.offset
                    if offset not in offset_pitches:
                        offset_pitches[offset] = set()
                    if isinstance(el, m21.note.Note):
                        offset_pitches[offset].add(el.pitch.ps)
                    elif isinstance(el, m21.chord.Chord):
                        for p in el.pitches:
                            offset_pitches[offset].add(p.ps)
            
            # 2. Compute running split points for each offset
            offset_splits = {}
            running_split = 60.0
            alpha = 0.2
            
            for offset in sorted(offset_pitches.keys()):
                pitches = sorted(list(offset_pitches[offset]))
                best_split = running_split
                if len(pitches) >= 2:
                    best_score = -999999
                    for i in range(len(pitches) - 1):
                        p1 = pitches[i]
                        p2 = pitches[i+1]
                        gap_size = p2 - p1
                        c_split = (p1 + p2) / 2.0
                        
                        if 50 <= c_split <= 72:
                            gap_score = gap_size - 1.5 * abs(c_split - running_split) - 0.5 * abs(c_split - 60.0)
                            if gap_score > best_score:
                                best_score = gap_score
                                best_split = c_split
                    running_split = alpha * best_split + (1.0 - alpha) * running_split
                elif len(pitches) == 1:
                    running_split = 0.1 * 60.0 + 0.9 * running_split
                
                offset_splits[offset] = running_split
            
            # 3. Create target parts
            treble_part = m21.stream.Part()
            treble_part.partName = 'Right Hand'
            treble_part.id = 'Right Hand'
            treble_part.insert(0.0, m21.clef.TrebleClef())
            
            bass_part = m21.stream.Part()
            bass_part.partName = 'Left Hand'
            bass_part.id = 'Left Hand'
            bass_part.insert(0.0, m21.clef.BassClef())
            
            # 4. Copy key/time signatures and metronome marks from all parts
            key_sigs = {}
            time_sigs = {}
            tempo_marks = {}
            for part in score.parts:
                part_flat = part.flatten()
                for ks in part_flat.getElementsByClass(m21.key.KeySignature):
                    if ks.offset not in key_sigs:
                        key_sigs[ks.offset] = ks
                for ts in part_flat.getElementsByClass(m21.meter.TimeSignature):
                    if ts.offset not in time_sigs:
                        time_sigs[ts.offset] = ts
                for mm in part_flat.getElementsByClass(m21.tempo.MetronomeMark):
                    if mm.offset not in tempo_marks:
                        tempo_marks[mm.offset] = mm
                    
            if not time_sigs:
                if 'interstellar' in base_name.lower() or 'cornfield' in base_name.lower():
                    time_sigs[0.0] = m21.meter.TimeSignature('3/4')
                else:
                    time_sigs[0.0] = m21.meter.TimeSignature('4/4')
                
            for offset, ks in key_sigs.items():
                treble_part.insert(offset, copy.deepcopy(ks))
                bass_part.insert(offset, copy.deepcopy(ks))
            for offset, ts in time_sigs.items():
                treble_part.insert(offset, copy.deepcopy(ts))
                bass_part.insert(offset, copy.deepcopy(ts))
            for offset, mm in tempo_marks.items():
                treble_part.insert(offset, copy.deepcopy(mm))
                bass_part.insert(offset, copy.deepcopy(mm))
            
            # 5. Route all notes/chords to treble or bass based on the computed offset split points
            for part in score.parts:
                for el in part.flatten().getElementsByClass([m21.note.Note, m21.chord.Chord, m21.note.Rest]):
                    offset = el.offset
                    
                    if isinstance(el, m21.note.Rest):
                        # Rest goes to both or gets handled by makeMeasures, but we can copy it to both to fill space
                        treble_part.insert(offset, copy.deepcopy(el))
                        bass_part.insert(offset, copy.deepcopy(el))
                        continue
                        
                    split_pt = offset_splits.get(offset, 60.0)
                    
                    if isinstance(el, m21.note.Note):
                        n_copy = copy.deepcopy(el)
                        if el.pitch.ps >= split_pt:
                            treble_part.insert(offset, n_copy)
                        else:
                            bass_part.insert(offset, n_copy)
                    elif isinstance(el, m21.chord.Chord):
                        treble_pitches = [p for p in el.pitches if p.ps >= split_pt]
                        bass_pitches = [p for p in el.pitches if p.ps < split_pt]
                        
                        if treble_pitches:
                            c_treble = m21.chord.Chord(treble_pitches)
                            c_treble.duration = el.duration
                            treble_part.insert(offset, c_treble)
                        if bass_pitches:
                            c_bass = m21.chord.Chord(bass_pitches)
                            c_bass.duration = el.duration
                            bass_part.insert(offset, c_bass)
                            
            # Ensure equal measure counts
            highest_offset = max(treble_part.flatten().highestTime, bass_part.flatten().highestTime)
            if highest_offset > 0:
                treble_part.insert(highest_offset, m21.note.Rest(duration=m21.duration.Duration(0.25)))
                bass_part.insert(highest_offset, m21.note.Rest(duration=m21.duration.Duration(0.25)))
                
            # Create measures
            treble_measures = treble_part.makeMeasures()
            bass_measures = bass_part.makeMeasures()
            
            new_score = m21.stream.Score()
            new_score.insert(0, treble_measures)
            new_score.insert(0, bass_measures)
            score = new_score
            
        output_path = os.path.join(output_dir, f"{base_name}.musicxml")
        print(f"Writing MusicXML: {output_path}...")
        score.write('musicxml', fp=output_path)
        
        # Clean up the output MusicXML of malformed tuplets
        clean_musicxml_tuplets(output_path)
        
        print("Success! File converted and placed in public/scores/.")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Failed to convert: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python convert_midi_to_xml.py <path_to_midi_or_abc_file>")
    else:
        convert(sys.argv[1])
