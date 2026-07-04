import music21 as m21
import os

output_dir = "public/scores"

def make_twinkle():
    # Both hands, melody in right, chords in left
    s = m21.stream.Score()
    
    pt = m21.stream.Part()
    pt.insert(0, m21.clef.TrebleClef())
    pt.insert(0, m21.meter.TimeSignature('4/4'))
    
    pb = m21.stream.Part()
    pb.insert(0, m21.clef.BassClef())
    pb.insert(0, m21.meter.TimeSignature('4/4'))
    
    # Twinkle: A B A Form
    t_notes = [
        # A 
        ('C4', 1.0), ('C4', 1.0), ('G4', 1.0), ('G4', 1.0),
        ('A4', 1.0), ('A4', 1.0), ('G4', 2.0),
        ('F4', 1.0), ('F4', 1.0), ('E4', 1.0), ('E4', 1.0),
        ('D4', 1.0), ('D4', 1.0), ('C4', 2.0),
        
        # B
        ('G4', 1.0), ('G4', 1.0), ('F4', 1.0), ('F4', 1.0),
        ('E4', 1.0), ('E4', 1.0), ('D4', 2.0),
        ('G4', 1.0), ('G4', 1.0), ('F4', 1.0), ('F4', 1.0),
        ('E4', 1.0), ('E4', 1.0), ('D4', 2.0),
        
        # A
        ('C4', 1.0), ('C4', 1.0), ('G4', 1.0), ('G4', 1.0),
        ('A4', 1.0), ('A4', 1.0), ('G4', 2.0),
        ('F4', 1.0), ('F4', 1.0), ('E4', 1.0), ('E4', 1.0),
        ('D4', 1.0), ('D4', 1.0), ('C4', 2.0)
    ]
    
    # Bass chords: C major (C3 E3 G3) for 2 measures, F major (F3 A3 C4) for 1 measure, C major for 1 measure
    # C major, C major, G major (G3 B3 D4), C major
    b_chords = [
        # A
        (['C3', 'E3', 'G3'], 2.0), (['C3', 'E3', 'G3'], 2.0),
        (['F3', 'A3', 'C4'], 2.0), (['C3', 'E3', 'G3'], 2.0),
        (['F3', 'A3', 'C4'], 2.0), (['C3', 'E3', 'G3'], 2.0),
        (['G3', 'B3', 'D4'], 2.0), (['C3', 'E3', 'G3'], 2.0),
        
        # B
        (['C3', 'E3', 'G3'], 2.0), (['F3', 'A3', 'C4'], 2.0),
        (['C3', 'E3', 'G3'], 2.0), (['G3', 'B3', 'D4'], 2.0),
        (['C3', 'E3', 'G3'], 2.0), (['F3', 'A3', 'C4'], 2.0),
        (['C3', 'E3', 'G3'], 2.0), (['G3', 'B3', 'D4'], 2.0),
        
        # A
        (['C3', 'E3', 'G3'], 2.0), (['C3', 'E3', 'G3'], 2.0),
        (['F3', 'A3', 'C4'], 2.0), (['C3', 'E3', 'G3'], 2.0),
        (['F3', 'A3', 'C4'], 2.0), (['C3', 'E3', 'G3'], 2.0),
        (['G3', 'B3', 'D4'], 2.0), (['C3', 'E3', 'G3'], 2.0)
    ]
    
    mt = m21.stream.Measure(); mt.number = 1; beats = 0
    for pitch, dur in t_notes:
        n = m21.note.Note(pitch)
        n.duration = m21.duration.Duration(dur)
        mt.append(n)
        beats += dur
        if beats >= 4:
            pt.append(mt)
            mt = m21.stream.Measure()
            mt.number = len(pt.getElementsByClass('Measure')) + 1
            beats = 0
            
    mb = m21.stream.Measure(); mb.number = 1; beats = 0
    for pitches, dur in b_chords:
        c = m21.chord.Chord(pitches)
        c.duration = m21.duration.Duration(dur)
        mb.append(c)
        beats += dur
        if beats >= 4:
            pb.append(mb)
            mb = m21.stream.Measure()
            mb.number = len(pb.getElementsByClass('Measure')) + 1
            beats = 0
            
    s.insert(0, pt)
    s.insert(0, pb)
    s.write('musicxml', fp=os.path.join(output_dir, "Twinkle_Twinkle.musicxml"))

if __name__ == "__main__":
    make_twinkle()
    print("Twinkle generated.")
