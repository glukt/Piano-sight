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

def split_to_grand_staff(part):
    """Splits a single-track Part into Treble (Right Hand) and Bass (Left Hand) parts.
    
    Uses a running split point algorithm to group pitches logically and prevent
    notes from jumping rapidly between staves.
    """
    print("Splitting single part into Treble and Bass staves...")
    
    part_id_str = str(part.id)
    treble_part = m21.stream.Part()
    treble_part.id = part_id_str + '_treble'
    treble_part.partName = 'Right Hand'
    treble_part.insert(0.0, m21.clef.TrebleClef())
    
    bass_part = m21.stream.Part()
    bass_part.id = part_id_str + '_bass'
    bass_part.partName = 'Left Hand'
    bass_part.insert(0.0, m21.clef.BassClef())
    
    # Copy key, time signatures, and metronome marks
    flat_orig = part.flatten()
    for el in flat_orig.getElementsByClass([m21.key.KeySignature, m21.meter.TimeSignature, m21.tempo.MetronomeMark]):
        treble_part.insert(el.offset, copy.deepcopy(el))
        bass_part.insert(el.offset, copy.deepcopy(el))
        
    # Group notes and chords by offset
    offset_elements = {}
    for el in flat_orig.getElementsByClass([m21.note.Note, m21.chord.Chord]):
        offset = el.offset
        if offset not in offset_elements:
            offset_elements[offset] = []
        offset_elements[offset].append(el)
        
    running_split = 60.0
    alpha = 0.2  # smoothing factor for running split point
    
    for offset in sorted(offset_elements.keys()):
        elements = offset_elements[offset]
        
        # Collect all pitches starting at this offset
        pitches = []
        for el in elements:
            if isinstance(el, m21.note.Note):
                pitches.append(el.pitch.ps)
            elif isinstance(el, m21.chord.Chord):
                pitches.extend([p.ps for p in el.pitches])
                
        pitches = sorted(list(set(pitches)))
        
        best_split = running_split
        if len(pitches) >= 2:
            best_score = -999999
            for i in range(len(pitches) - 1):
                p1 = pitches[i]
                p2 = pitches[i+1]
                gap_size = p2 - p1
                c_split = (p1 + p2) / 2.0
                
                # Check within middle register [50, 72]
                if 50 <= c_split <= 72:
                    # Score based on gap size and proximity to running split and middle C
                    score = gap_size - 1.5 * abs(c_split - running_split) - 0.5 * abs(c_split - 60.0)
                    if score > best_score:
                        best_score = score
                        best_split = c_split
            
            # Smoothly update split point
            running_split = alpha * best_split + (1.0 - alpha) * running_split
        elif len(pitches) == 1:
            # Re-center slightly towards 60 if it wandered off
            running_split = 0.1 * 60.0 + 0.9 * running_split
            
        # Split notes/chords based on running_split
        for el in elements:
            if isinstance(el, m21.note.Note):
                n_copy = m21.note.Note(el.pitch)
                n_copy.duration = el.duration
                if el.pitch.ps >= running_split:
                    treble_part.insert(offset, n_copy)
                else:
                    bass_part.insert(offset, n_copy)
            elif isinstance(el, m21.chord.Chord):
                treble_pitches = [p for p in el.pitches if p.ps >= running_split]
                bass_pitches = [p for p in el.pitches if p.ps < running_split]
                
                if treble_pitches:
                    c_treble = m21.chord.Chord(treble_pitches)
                    c_treble.duration = el.duration
                    treble_part.insert(offset, c_treble)
                if bass_pitches:
                    c_bass = m21.chord.Chord(bass_pitches)
                    c_bass.duration = el.duration
                    bass_part.insert(offset, c_bass)
                    
    # Pad both parts to the highest offset to ensure equal measure counts
    highest_offset = flat_orig.highestTime
    if highest_offset > 0:
        treble_part.insert(highest_offset, m21.note.Rest(duration=m21.duration.Duration(0.25)))
        bass_part.insert(highest_offset, m21.note.Rest(duration=m21.duration.Duration(0.25)))
        
    # Automatically partition into measures and fill with rests
    treble_measures = treble_part.makeMeasures()
    bass_measures = bass_part.makeMeasures()
    
    return treble_measures, bass_measures

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
                    key_sigs[ks.offset] = ks
                for ts in part_flat.getElementsByClass(m21.meter.TimeSignature):
                    time_sigs[ts.offset] = ts
                for mm in part_flat.getElementsByClass(m21.tempo.MetronomeMark):
                    tempo_marks[mm.offset] = mm
                    
            if not time_sigs:
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
            print(f"Flattening parts (found {len(active_parts)} active parts)...")
            offset_notes = {}
            for part in score.parts:
                for el in part.flatten().getElementsByClass([m21.note.Note, m21.chord.Chord]):
                    offset = el.offset
                    if offset not in offset_notes:
                        offset_notes[offset] = []
                    offset_notes[offset].append(el)
                    
            flat_part = m21.stream.Part()
            flat_part.id = 'flat_piano'
            flat_part.partName = 'Piano'
            
            # Copy all signatures and metronome marks from the original parts
            key_sigs = {}
            time_sigs = {}
            tempo_marks = {}
            for part in score.parts:
                part_flat = part.flatten()
                for ks in part_flat.getElementsByClass(m21.key.KeySignature):
                    key_sigs[ks.offset] = ks
                for ts in part_flat.getElementsByClass(m21.meter.TimeSignature):
                    time_sigs[ts.offset] = ts
                for mm in part_flat.getElementsByClass(m21.tempo.MetronomeMark):
                    tempo_marks[mm.offset] = mm
                    
            for offset, ks in key_sigs.items():
                flat_part.insert(offset, copy.deepcopy(ks))
            for offset, ts in time_sigs.items():
                flat_part.insert(offset, copy.deepcopy(ts))
            for offset, mm in tempo_marks.items():
                flat_part.insert(offset, copy.deepcopy(mm))
                
            for offset in sorted(offset_notes.keys()):
                elements = offset_notes[offset]
                pitches = set()
                max_duration = m21.duration.Duration(0.0)
                for el in elements:
                    if isinstance(el, m21.note.Note):
                        pitches.add(el.pitch)
                        if el.duration.quarterLength > max_duration.quarterLength:
                            max_duration = el.duration
                    elif isinstance(el, m21.chord.Chord):
                        for p in el.pitches:
                            pitches.add(p)
                        if el.duration.quarterLength > max_duration.quarterLength:
                            max_duration = el.duration
                            
                if pitches:
                    if len(pitches) == 1:
                        new_note = m21.note.Note(list(pitches)[0])
                        new_note.duration = max_duration
                        flat_part.insert(offset, new_note)
                    else:
                        new_chord = m21.chord.Chord(list(pitches))
                        new_chord.duration = max_duration
                        flat_part.insert(offset, new_chord)
                        
            # Re-quantize flat part with triplets
            flat_part.quantize(quarterLengthDivisors=(4, 3), processOffsets=True, processDurations=True, inPlace=True)
            
            # Now split it into a grand staff
            treble_part, bass_part = split_to_grand_staff(flat_part)
            new_score = m21.stream.Score()
            new_score.insert(0, treble_part)
            new_score.insert(0, bass_part)
            score = new_score
            
        output_path = os.path.join(output_dir, f"{base_name}.musicxml")
        print(f"Writing MusicXML: {output_path}...")
        score.write('musicxml', fp=output_path)
        
        # Clean up the output MusicXML of malformed tuplets
        clean_musicxml_tuplets(output_path)
        
        print("Success! File converted and placed in public/scores/.")
    except Exception as e:
        print(f"Failed to convert: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python convert_midi_to_xml.py <path_to_midi_or_abc_file>")
    else:
        convert(sys.argv[1])
