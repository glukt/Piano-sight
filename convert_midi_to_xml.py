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
            if el.pitch.ps >= 60:  # C4 (Middle C) is MIDI note 60
                treble_part.insert(el.offset, el)
            else:
                bass_part.insert(el.offset, el)
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
        # (4, 3) snaps to 16th notes (divisor 4) and triplets (divisor 3)
        score.quantize(quarterLengthDivisors=(4, 3), processOffsets=True, processDurations=True, inPlace=True, recurse=True)
        
        # If the score has only 1 part, split it into a grand staff
        if len(score.parts) == 1:
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
