import music21 as m21
import os

output_dir = "public/scores"

def make_mary():
    # Treble only (E D C D E E E, D D D, E G G)
    s = m21.stream.Score()
    p = m21.stream.Part()
    p.insert(0, m21.clef.TrebleClef())
    p.insert(0, m21.meter.TimeSignature('4/4'))
    
    notes = [
        ('E4', 1.0), ('D4', 1.0), ('C4', 1.0), ('D4', 1.0),
        ('E4', 1.0), ('E4', 1.0), ('E4', 2.0),
        ('D4', 1.0), ('D4', 1.0), ('D4', 2.0),
        ('E4', 1.0), ('G4', 1.0), ('G4', 2.0),
        
        ('E4', 1.0), ('D4', 1.0), ('C4', 1.0), ('D4', 1.0),
        ('E4', 1.0), ('E4', 1.0), ('E4', 1.0), ('E4', 1.0),
        ('D4', 1.0), ('D4', 1.0), ('E4', 1.0), ('D4', 1.0),
        ('C4', 4.0)
    ]
    
    m = m21.stream.Measure()
    m.number = 1
    beats = 0
    for pitch, dur in notes:
        n = m21.note.Note(pitch)
        n.duration = m21.duration.Duration(dur)
        m.append(n)
        beats += dur
        if beats >= 4:
            p.append(m)
            m = m21.stream.Measure()
            m.number = len(p.getElementsByClass('Measure')) + 1
            beats = 0
            
    if len(m) > 0:
        p.append(m)
        
    s.insert(0, p)
    s.write('musicxml', fp=os.path.join(output_dir, "Mary_Lamb.musicxml"))

def make_au_clair():
    # Both Hands (c c c d e d, c e d d c)
    s = m21.stream.Score()
    
    pt = m21.stream.Part()
    pt.insert(0, m21.clef.TrebleClef())
    pt.insert(0, m21.meter.TimeSignature('4/4'))
    
    pb = m21.stream.Part()
    pb.insert(0, m21.clef.BassClef())
    pb.insert(0, m21.meter.TimeSignature('4/4'))
    
    t_notes = [
        ('C4', 1.0), ('C4', 1.0), ('C4', 1.0), ('D4', 1.0),
        ('E4', 2.0), ('D4', 2.0),
        ('C4', 1.0), ('E4', 1.0), ('D4', 1.0), ('D4', 1.0),
        ('C4', 4.0),
        
        ('C4', 1.0), ('C4', 1.0), ('C4', 1.0), ('D4', 1.0),
        ('E4', 2.0), ('D4', 2.0),
        ('C4', 1.0), ('E4', 1.0), ('D4', 1.0), ('D4', 1.0),
        ('C4', 4.0)
    ]
    
    b_notes = [
        ('C3', 4.0), ('G3', 4.0), ('C3', 2.0), ('G3', 2.0), ('C3', 4.0),
        ('C3', 4.0), ('G3', 4.0), ('C3', 2.0), ('G3', 2.0), ('C3', 4.0)
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
    for pitch, dur in b_notes:
        n = m21.note.Note(pitch)
        n.duration = m21.duration.Duration(dur)
        mb.append(n)
        beats += dur
        if beats >= 4:
            pb.append(mb)
            mb = m21.stream.Measure()
            mb.number = len(pb.getElementsByClass('Measure')) + 1
            beats = 0
            
    s.insert(0, pt)
    s.insert(0, pb)
    s.write('musicxml', fp=os.path.join(output_dir, "Au_Clair_De_La_Lune.musicxml"))

def make_elise():
    # Fur Elise theme simplified: E D# E D# E B D C A (no tuplets, straight 8ths in 3/4)
    s = m21.stream.Score()
    
    pt = m21.stream.Part()
    pt.insert(0, m21.clef.TrebleClef())
    pt.insert(0, m21.meter.TimeSignature('3/4'))
    
    pb = m21.stream.Part()
    pb.insert(0, m21.clef.BassClef())
    pb.insert(0, m21.meter.TimeSignature('3/4'))
    
    # Needs a pickup measure handled via rests for simplicity:
    t_notes = [
        ('B4', 1.0), ('E5', 0.5), ('D#5', 0.5),
        
        ('E5', 0.5), ('D#5', 0.5), ('E5', 0.5), ('B4', 0.5), ('D5', 0.5), ('C5', 0.5),
        ('A4', 1.0), ('C4', 0.5), ('E4', 0.5), ('A4', 0.5), ('B4', 0.5),
        ('B4', 1.0), ('E4', 0.5), ('G#4', 0.5), ('B4', 0.5), ('C5', 0.5),
        ('C5', 1.0), ('E4', 0.5), ('E5', 0.5), ('D#5', 0.5),
        
        ('E5', 0.5), ('D#5', 0.5), ('E5', 0.5), ('B4', 0.5), ('D5', 0.5), ('C5', 0.5),
        ('A4', 1.0), ('C4', 0.5), ('E4', 0.5), ('A4', 0.5), ('B4', 0.5),
        ('B4', 1.0), ('E4', 0.5), ('C5', 0.5), ('B4', 0.5), ('A4', 0.5),
        ('A4', 2.0), ('B4', 1.0)
    ]
    
    # Bass accompaniment
    b_notes = [
        ('A2', 2.0), # corresponds to pickup
        
        ('A2', 3.0),
        ('E3', 3.0),
        ('E3', 3.0),
        ('A2', 3.0),
        
        ('A2', 3.0),
        ('E3', 3.0),
        ('A2', 3.0),
        ('A2', 3.0)
    ]
    
    mt = m21.stream.Measure(); mt.number = 1; beats = 0
    t_idx = 0
    for pitch, dur in t_notes:
        n = m21.note.Note(pitch)
        n.duration = m21.duration.Duration(dur)
        mt.append(n)
        beats += dur
        if (t_idx == 0 and beats >= 2) or (t_idx > 0 and beats >= 3): # Hacky pickup
            pt.append(mt)
            mt = m21.stream.Measure()
            mt.number = len(pt.getElementsByClass('Measure')) + 1
            beats = 0
            t_idx += 1
            
            
    mb = m21.stream.Measure(); mb.number = 1; beats = 0
    b_idx = 0
    for pitch, dur in b_notes:
        n = m21.note.Note(pitch)
        n.duration = m21.duration.Duration(dur)
        mb.append(n)
        beats += dur
        if (b_idx == 0 and beats >= 2) or (b_idx > 0 and beats >= 3):
            pb.append(mb)
            mb = m21.stream.Measure()
            mb.number = len(pb.getElementsByClass('Measure')) + 1
            beats = 0
            b_idx += 1
            
    s.insert(0, pt)
    s.insert(0, pb)
    s.write('musicxml', fp=os.path.join(output_dir, "Fur_Elise_Simplified.musicxml"))

if __name__ == "__main__":
    make_mary()
    make_au_clair()
    make_elise()
    print("Generated Mary, Au Clair, & Fur Elise.")
