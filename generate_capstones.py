import music21 as m21
import os

output_dir = "public/scores"
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

def make_ode_to_joy():
    # Treble only, C position (E E F G G F E D C C D E E D D)
    s = m21.stream.Score()
    p = m21.stream.Part()
    p.insert(0, m21.clef.TrebleClef())
    p.insert(0, m21.meter.TimeSignature('4/4'))
    
    notes = [
        # A section
        ('E4', 1.0), ('E4', 1.0), ('F4', 1.0), ('G4', 1.0),
        ('G4', 1.0), ('F4', 1.0), ('E4', 1.0), ('D4', 1.0),
        ('C4', 1.0), ('C4', 1.0), ('D4', 1.0), ('E4', 1.0),
        ('E4', 1.5), ('D4', 0.5), ('D4', 2.0),
        
        # A' section
        ('E4', 1.0), ('E4', 1.0), ('F4', 1.0), ('G4', 1.0),
        ('G4', 1.0), ('F4', 1.0), ('E4', 1.0), ('D4', 1.0),
        ('C4', 1.0), ('C4', 1.0), ('D4', 1.0), ('E4', 1.0),
        ('D4', 1.5), ('C4', 0.5), ('C4', 2.0),
        
        # B section
        ('D4', 1.0), ('D4', 1.0), ('E4', 1.0), ('C4', 1.0),
        ('D4', 1.0), ('E4', 0.5), ('F4', 0.5), ('E4', 1.0), ('C4', 1.0),
        ('D4', 1.0), ('E4', 0.5), ('F4', 0.5), ('E4', 1.0), ('D4', 1.0),
        ('C4', 1.0), ('D4', 1.0), ('G3', 2.0),
        
        # A' section
        ('E4', 1.0), ('E4', 1.0), ('F4', 1.0), ('G4', 1.0),
        ('G4', 1.0), ('F4', 1.0), ('E4', 1.0), ('D4', 1.0),
        ('C4', 1.0), ('C4', 1.0), ('D4', 1.0), ('E4', 1.0),
        ('D4', 1.5), ('C4', 0.5), ('C4', 2.0)
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
    s.write('musicxml', fp=os.path.join(output_dir, "Ode_to_Joy.musicxml"))

def make_wenceslas():
    # Bass only, C position (G G G A G G D E D E F G G G)
    s = m21.stream.Score()
    p = m21.stream.Part()
    p.insert(0, m21.clef.BassClef())
    p.insert(0, m21.meter.TimeSignature('4/4'))
    
    # Actually Good King Wenceslas in Bass C: F F F G F F C D C D E F F F
    # Let's use: C3 C3 C3 D3 C3 C3 G2 A2 G2 A2 B2 C3 C3 C3 for the first phrase
    # Phrase 1: Good King Wenceslas look'd out, On the feast of Stephen
    notes = [
        ('C3', 1.0), ('C3', 1.0), ('C3', 1.0), ('D3', 1.0),
        ('C3', 1.0), ('C3', 1.0), ('G2', 2.0),
        ('A2', 1.0), ('G2', 1.0), ('A2', 1.0), ('B2', 1.0),
        ('C3', 2.0), ('C3', 2.0),
        
        # Phrase 2: When the snow lay round about, Deep and crisp and even
        ('C3', 1.0), ('C3', 1.0), ('C3', 1.0), ('D3', 1.0),
        ('C3', 1.0), ('C3', 1.0), ('G2', 2.0),
        ('A2', 1.0), ('G2', 1.0), ('A2', 1.0), ('B2', 1.0),
        ('C3', 2.0), ('C3', 2.0),
        
        # Phrase 3: Brightly shone the moon that night, Though the frost was cruel
        ('G3', 1.0), ('F3', 1.0), ('E3', 1.0), ('D3', 1.0),
        ('E3', 1.0), ('C3', 1.0), ('G2', 2.0),
        ('A2', 1.0), ('G2', 1.0), ('A2', 1.0), ('B2', 1.0),
        ('C3', 2.0), ('C3', 2.0),
        
        # Phrase 4: When a poor man came in sight, Gath'ring winter fuel.
        ('G2', 1.0), ('G2', 1.0), ('A2', 1.0), ('B2', 1.0),
        ('C3', 1.0), ('D3', 1.0), ('E3', 2.0),
        ('F3', 1.0), ('E3', 1.0), ('D3', 1.0), ('E3', 1.0),
        ('C3', 2.0), ('C3', 2.0) 
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
    s.write('musicxml', fp=os.path.join(output_dir, "Good_King_Wenceslas.musicxml"))

def make_jingle_bells():
    # Both hands
    s = m21.stream.Score()
    
    pt = m21.stream.Part()
    pt.insert(0, m21.clef.TrebleClef())
    pt.insert(0, m21.meter.TimeSignature('4/4'))
    
    pb = m21.stream.Part()
    pb.insert(0, m21.clef.BassClef())
    pb.insert(0, m21.meter.TimeSignature('4/4'))
    
    # Treble notes: Jingle Bells Chorus (Full)
    t_notes = [
        # Jingle bells, jingle bells, jingle all the way
        ('E4', 1.0), ('E4', 1.0), ('E4', 2.0),
        ('E4', 1.0), ('E4', 1.0), ('E4', 2.0),
        ('E4', 1.0), ('G4', 1.0), ('C4', 1.5), ('D4', 0.5),
        ('E4', 4.0),
        
        # Oh what fun it is to ride in a one horse open sleigh, hey!
        ('F4', 1.0), ('F4', 1.0), ('F4', 1.5), ('F4', 0.5),
        ('F4', 1.0), ('E4', 1.0), ('E4', 2.0),
        ('E4', 1.0), ('D4', 1.0), ('D4', 1.0), ('E4', 1.0),
        ('D4', 2.0), ('G4', 2.0),
        
        # Jingle bells, jingle bells, jingle all the way
        ('E4', 1.0), ('E4', 1.0), ('E4', 2.0),
        ('E4', 1.0), ('E4', 1.0), ('E4', 2.0),
        ('E4', 1.0), ('G4', 1.0), ('C4', 1.5), ('D4', 0.5),
        ('E4', 4.0),
        
        # Oh what fun it is to ride in a one horse open sleigh.
        ('F4', 1.0), ('F4', 1.0), ('F4', 1.5), ('F4', 0.5),
        ('F4', 1.0), ('E4', 1.0), ('E4', 2.0),
        ('G4', 1.0), ('G4', 1.0), ('F4', 1.0), ('D4', 1.0),
        ('C4', 4.0)
    ]
    
    # Bass notes: C3 (whole), C3 (whole), C3 (whole), C3 (whole)
    b_notes = [
        # Phrase 1
        ('C3', 4.0), ('C3', 4.0), ('C3', 4.0), ('C3', 4.0),
        # Phrase 2 (F major imply, C major imply, G major imply)
        ('F2', 4.0), ('C3', 4.0), ('G2', 4.0), ('G2', 4.0),
        # Phrase 3
        ('C3', 4.0), ('C3', 4.0), ('C3', 4.0), ('C3', 4.0),
        # Phrase 4
        ('F2', 4.0), ('C3', 4.0), ('G2', 4.0), ('C3', 4.0)
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
    s.write('musicxml', fp=os.path.join(output_dir, "Jingle_Bells.musicxml"))

if __name__ == "__main__":
    make_ode_to_joy()
    make_wenceslas()
    make_jingle_bells()
    print("Successfully generated Capstone songs.")
