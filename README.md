## Preview
![screenshot1](<assets/Screenshot 2025-04-22 003537.png>)

![screenshot2](<assets/Screenshot 2025-04-22 004112.png>)

![screenshot3](<assets/Screenshot 2025-04-22 004256.png>)

![screenshot4](<assets/Screenshot 2025-04-22 011832.png>)

## Installation & Usage
just copy pase the settins.json file
install any extension to inject the custom css and js like
Custom UI Style
Custom CSS Hot Reload
Custom CSS and JS Loader
update or add the paths for the custom file in settings.json and enable the extension

##
to have the same look you see there are mainly two parts
1. the css and js files (to have the rounded corners and the other non vscode things)
2. the settings.json file which has the theme under "workbench.colorCustomizations"

the css has a vriable called --accent-color and you can also change it from settings.json under "custom-ui-style.stylesheet"

so if you got all the files from the github and you what to have a custom accent color just go to the settings.json file go tho the line 46 the contains the --accent-color css variable double click it to select then CTRL + SHIFT + L to select all the accent colors in the file and write or paste your new one the green you are aking for is #16B673