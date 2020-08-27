const JourneyIFrameClient = require('journey-iframe-client');
const $ = require('jquery');
(window as any).$ = $;
(window as any).jQuery = $;
require('bootstrap');
// require('./vendor/colorpicker');
require('spectrum-colorpicker');

// using https://github.com/djaodjin/djaodjin-annotate/
require('./vendor/annotate');
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/spectrum-colorpicker/spectrum.css';

import './sass/main.scss';

const journeyIFrameClient = new JourneyIFrameClient();
var selectedColor = "#000000";

journeyIFrameClient.on('loadImage', function (image) {


        $('#myCanvas').annotate({
            color: selectedColor,
            linewidth: 4,
            width: "400",
            height: "400",
            bootstrap: true,
            images: [`data:image/jpeg;base64,${image}`],
            selectEvent: "changeColor",
            onExport: function(image) {
                journeyIFrameClient.post('image-annotated', image);
            },
            showPalette: false
        });
});

$(document).ready(function(){
    $("#save-image").click(function(event) {
        $('#myCanvas').annotate("export", {type: "image/jpeg", quality: 1.0}, function(){
            console.log("Exporting");
        });
    });

    $("#full").spectrum({
    color: selectedColor,
    showInput: true,
    className: "full-spectrum",
    showInitial: true,
    showPalette: true,
    showPaletteOnly: true,
    hideAfterPaletteSelect: true,
    showSelectionPalette: false,
    showButtons: true,
    preferredFormat: "hex",
    maxSelectionSize: 8,
    change: function(color) {
        // (window as any).selectedColor = color.toString();
        console.log('COLOR CHANGED! ', color);
        // $('#myCanvas').annotate('setColor', (window as any).selectedColor);
        selectedColor = color.toString();
        $('#myCanvas').annotate('setColor', selectedColor);
        // $('#myCanvas').annotate({color: selectedColor});
    },
    palette: [
        ["rgb(0, 0, 0)", "rgb(67, 67, 67)", "rgb(102, 102, 102)", "rgb(204, 204, 204)","rgb(255, 255, 255)"],
        ["rgb(152, 0, 0)", "rgb(255, 0, 0)", "rgb(255, 153, 0)", "rgb(255, 255, 0)", "rgb(0, 255, 0)"],
        ["rgb(0, 255, 255)", "rgb(74, 134, 232)", "rgb(0, 0, 255)", "rgb(153, 0, 255)", "rgb(255, 0, 255)"]
    ]
});




});
