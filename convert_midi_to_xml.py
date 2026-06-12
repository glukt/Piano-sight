import sys
import os
import music21 as m21

def split_to_grand_staff(part):
    """Splits a single-track Part into Treble (Right Hand) and Bass (Left Hand) parts."""
    print("Splitting single part into Treble and Bass staves...")
    
    part_id_str = str(part.id)
    treble_part = m21.stream.Part()
    treble_part.id = part_id_str + '_treble'
    treble_part.partName = 'Right Hand'
    
    # Set clefs
    treble_part.insert(0.0, m21.clef.TrebleClef())
    
    bass_part = m21.stream.Part()
    bass_part.id = part_id_str + '_bass'
    bass_part.partName = 'Left Hand'
    bass_part.insert(0.0, m21.clef.BassClef())
    
    # Copy key and time signatures
    flat_orig = part.flatten()
    for el in flat_orig.getElementsByClass([m21.key.KeySignature, m21.meter.TimeSignature]):
        treble_part.insert(el.offset, el)
        bass_part.insert(el.offset, el)
        
    # Split notes and chords
    for el in flat_orig:
        if isinstance(el, m21.note.Note):
            n_copy = m21.note.Note(el.pitch)
            n_copy.duration = el.duration
            if el.pitch.ps >= 60:  # C4 (Middle C) is MIDI note 60
                treble_part.insert(el.offset, n_copy)
            else:
                bass_part.insert(el.offset, n_copy)
        elif isinstance(el, m21.chord.Chord):
            treble_pitches = [p for p in el.pitches if p.ps >= 60]
            bass_pitches = [p for p in el.pitches if p.ps < 60]
            
            if treble_pitches:
                c_treble = m21.chord.Chord(treble_pitches)
                c_treble.duration = el.duration
                treble_part.insert(el.offset, c_treble)
            if bass_pitches:
                c_bass = m21.chord.Chord(bass_pitches)
                c_bass.duration = el.duration
                bass_part.insert(el.offset, c_bass)
                
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
        print("Quantizing score rhythms...")
        # divisor 4 snaps to 16th notes, avoiding malformed tuplets/triplets
        score.quantize(quarterLengthDivisors=(4,), processOffsets=True, processDurations=True, inPlace=True, recurse=True)
        
        # If the score has multiple parts, flatten them into a single part first
        if len(score.parts) > 1:
            print(f"Flattening {len(score.parts)} parts into a single part...")
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
            
            # Copy signatures
            first_part_flat = score.parts[0].flatten()
            for el in first_part_flat.getElementsByClass([m21.key.KeySignature, m21.meter.TimeSignature]):
                flat_part.insert(el.offset, el)
                
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
                        
            # Re-quantize flat part to clean up overlaps
            flat_part.quantize(quarterLengthDivisors=(4,), processOffsets=True, processDurations=True, inPlace=True)
            
            # Now split it into a grand staff
            treble_part, bass_part = split_to_grand_staff(flat_part)
            new_score = m21.stream.Score()
            new_score.insert(0, treble_part)
            new_score.insert(0, bass_part)
            score = new_score
        else:
            # Single part, split directly
            treble_part, bass_part = split_to_grand_staff(score.parts[0])
            new_score = m21.stream.Score()
            new_score.insert(0, treble_part)
            new_score.insert(0, bass_part)
            score = new_score
            
        output_path = os.path.join(output_dir, f"{base_name}.musicxml")
        print(f"Writing MusicXML: {output_path}...")
        score.write('musicxml', fp=output_path)
        print("Success! File converted and placed in public/scores/.")
    except Exception as e:
        print(f"Failed to convert: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python convert_midi_to_xml.py <path_to_midi_or_abc_file>")
    else:
        convert(sys.argv[1])
