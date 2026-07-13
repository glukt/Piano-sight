import zipfile
import re
import os

mxl_path = "c:/Users/g/Documents/GitHub/pianopilot/public/scores/Kiss_the_Rain_-_Yiruma.mxl"
temp_mxl_path = mxl_path + ".temp"

print(f"Cleaning MXL: {mxl_path}")

with zipfile.ZipFile(mxl_path, 'r') as zin:
    with zipfile.ZipFile(temp_mxl_path, 'w', zipfile.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            data = zin.read(item.filename)
            if item.filename == "score.xml":
                xml_content = data.decode('utf-8', errors='ignore')
                
                # Remove display-step and display-octave inside rest tags
                # e.g. <rest><display-step></display-step><display-octave>14</display-octave></rest>
                # We can do this using regex. Let's find all <rest>...</rest> and strip display elements.
                def clean_rest(match):
                    rest_inner = match.group(1)
                    # remove display-step
                    rest_inner = re.sub(r'<display-step[^>]*>.*?</display-step>', '', rest_inner)
                    # remove display-octave
                    rest_inner = re.sub(r'<display-octave[^>]*>.*?</display-octave>', '', rest_inner)
                    return f"<rest>{rest_inner}</rest>"
                
                cleaned_content = re.sub(r'<rest([^>]*)>(.*?)</rest>', lambda m: clean_rest(m), xml_content, flags=re.DOTALL)
                
                # Also handle self-closing rests or rests without closing tag if any (though usually rests with display tags have closing tags)
                data = cleaned_content.encode('utf-8')
                print("Cleaned score.xml rests successfully!")
            
            zout.writestr(item, data)

# Replace the original with the cleaned version
os.replace(temp_mxl_path, mxl_path)
print("Finished replacement successfully!")
