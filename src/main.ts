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
var defaultPalette = [
    ["rgb(0, 0, 0)", "rgb(67, 67, 67)", "rgb(102, 102, 102)", "rgb(204, 204, 204)","rgb(255, 255, 255)"],
    ["rgb(152, 0, 0)", "rgb(255, 0, 0)", "rgb(255, 153, 0)", "rgb(255, 255, 0)", "rgb(0, 255, 0)"],
    ["rgb(0, 255, 255)", "rgb(74, 134, 232)", "rgb(0, 0, 255)", "rgb(153, 0, 255)", "rgb(255, 0, 255)"]
];

journeyIFrameClient.on('loadImage', function (image, options) {
    options = options || {};
    selectedColor = options.color || "#000000";
    $(".my-image-selector").show();


    $('#myCanvas').annotate({
        color: selectedColor,
        linewidth: options.linewidth || 4,
        width: options.width,
        height: options.height,
        bootstrap: true,
        type: options.type || 'rectangle', // text, pen, circle, rectangle, arrow
        images: [`data:image/jpeg;base64,${image}`],
        selectEvent: "changeColor",
        onExport: function(image) {
            journeyIFrameClient.post('image-annotated', image);
        },
        showPalette: false
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
            selectedColor = color.toString();
            $('#myCanvas').annotate('setColor', selectedColor);
        },
        palette: options.palette || defaultPalette
    });

    $("#save-image").click(function(event) {
        $('#myCanvas').annotate("export", {type: "image/jpeg", quality: 1.0});
    });
});

$(document).ready(function(){
    $(".my-image-selector").hide();

});
