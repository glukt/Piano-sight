import music21 as m21
import os

output_dir = "public/scores"

def make_minuet():
    # Minuet in G (Simplified): G4 D5 C5 B4 A4 G4 F#4 G4, etc.
    s = m21.stream.Score()
    
    pt = m21.stream.Part()
    pt.insert(0, m21.clef.TrebleClef())
    pt.insert(0, m21.meter.TimeSignature('3/4'))
    
    pb = m21.stream.Part()
    pb.insert(0, m21.clef.BassClef())
    pb.insert(0, m21.meter.TimeSignature('3/4'))
    
    # Treble: G D C B A, G G, E C D E F#, G G, C D C B A, B C B A G, F# G A B G, B A
    t_notes = [
        ('D5', 1.0), ('G4', 0.5), ('A4', 0.5), ('B4', 0.5), ('C5', 0.5),
        ('D5', 1.0), ('G4', 1.0), ('G4', 1.0),
        ('E5', 1.0), ('C5', 0.5), ('D5', 0.5), ('E5', 0.5), ('F#5', 0.5),
        ('G5', 1.0), ('G4', 1.0), ('G4', 1.0),
        
        ('C5', 1.0), ('D5', 0.5), ('C5', 0.5), ('B4', 0.5), ('A4', 0.5),
        ('B4', 1.0), ('C5', 0.5), ('B4', 0.5), ('A4', 0.5), ('G4', 0.5),
        ('F#4', 1.0), ('G4', 0.5), ('A4', 0.5), ('B4', 0.5), ('G4', 0.5),
        ('B4', 1.0), ('A4', 2.0)
    ]
    
    # Bass: G Major, B minor, C Major, G Major, etc. (Simplified to single notes/dyads for Chords course)
    # We will use simple intervals for the bass to make it a Chords/Intervals hybrid challenge
    b_notes = [
        (['G3', 'D4'], 3.0),
        (['B3', 'D4'], 3.0),
        (['C3', 'E3'], 3.0),
        (['B2', 'D3'], 3.0),
        
        (['A2', 'C3'], 3.0),
        (['G2', 'B2'], 3.0),
        (['D3', 'F#3'], 3.0),
        (['G2', 'D3'], 3.0)
    ]
    
    mt = m21.stream.Measure(); mt.number = 1; beats = 0
    t_idx = 0
    for pitch, dur in t_notes:
        n = m21.note.Note(pitch)
        n.duration = m21.duration.Duration(dur)
        mt.append(n)
        beats += dur
        if beats >= 3:
            pt.append(mt)
            mt = m21.stream.Measure()
            mt.number = len(pt.getElementsByClass('Measure')) + 1
            beats = 0
            t_idx += 1
            
            
    mb = m21.stream.Measure(); mb.number = 1; beats = 0
    b_idx = 0
    for pitches, dur in b_notes:
        c = m21.chord.Chord(pitches)
        c.duration = m21.duration.Duration(dur)
        mb.append(c)
        beats += dur
        if beats >= 3:
            pb.append(mb)
            mb = m21.stream.Measure()
            mb.number = len(pb.getElementsByClass('Measure')) + 1
            beats = 0
            b_idx += 1
            
    s.insert(0, pt)
    s.insert(0, pb)
    s.write('musicxml', fp=os.path.join(output_dir, "Minuet_in_G.musicxml"))

if __name__ == "__main__":
    make_minuet()
    print("Generated Minuet in G.")
