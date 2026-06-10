import sys
import os
import music21 as m21

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
