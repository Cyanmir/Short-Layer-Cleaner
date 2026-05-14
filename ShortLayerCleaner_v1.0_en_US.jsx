(function () {
    // Check if there is an active composition
    var comp = app.project.activeItem;
    if (!comp || !(comp instanceof CompItem)) {
        alert("Please select a composition (CompItem) first.");
        return;
    }

    // Build UI
    var win = (this instanceof Panel) ?
        this :
        new Window("palette", "Short Layer Cleaner", undefined, { resizeable: false });
    win.orientation = "column";
    win.alignChildren = ["fill", "top"];
    win.spacing = 8;
    win.margins = 12;

    // --- Layer Type Filter ---
    var typeGroup = win.add("panel", undefined, "Layer Types (unchecked = all types)");
    typeGroup.orientation = "column";
    typeGroup.alignChildren = "left";
    typeGroup.spacing = 4;

    var chkText = typeGroup.add("checkbox", undefined, "Text Layers");
    var chkShape = typeGroup.add("checkbox", undefined, "Shape Layers");
    var chkAdj = typeGroup.add("checkbox", undefined, "Adjustment Layers");
    var chkLight = typeGroup.add("checkbox", undefined, "Lights");
    var chkCamera = typeGroup.add("checkbox", undefined, "Cameras");

    // --- Threshold Input ---
    var thresholdGroup = win.add("group");
    thresholdGroup.orientation = "row";
    thresholdGroup.alignChildren = ["center", "center"];
    thresholdGroup.spacing = 6;
    thresholdGroup.add("statictext", undefined, "Delete layers shorter than");
    var editFrames = thresholdGroup.add("edittext", undefined, "1");
    editFrames.characters = 6;
    thresholdGroup.add("statictext", undefined, "frames");

    // --- Buttons ---
    var btnGroup = win.add("group");
    btnGroup.orientation = "row";
    btnGroup.alignChildren = ["center", "center"];
    btnGroup.spacing = 10;

    var btnDelete = btnGroup.add("button", undefined, "Delete Layers");
    var btnClose = btnGroup.add("button", undefined, "Close");

    // --- Event Handlers ---
    btnClose.onClick = function () {
        win.close();
    };

    btnDelete.onClick = function () {
        // Read threshold value
        var thresholdFrames = parseFloat(editFrames.text);
        if (isNaN(thresholdFrames) || thresholdFrames < 0) {
            alert("Please enter a valid non-negative frame number.");
            return;
        }

        // Collect selected types
        var selectedTypes = [];
        if (chkText.value) selectedTypes.push("text");
        if (chkShape.value) selectedTypes.push("shape");
        if (chkAdj.value) selectedTypes.push("adjustment");
        if (chkLight.value) selectedTypes.push("light");
        if (chkCamera.value) selectedTypes.push("camera");

        var allTypes = (selectedTypes.length === 0); // If nothing checked, process all layers

        // Confirm operation
        var typeDesc = allTypes ? "all" : selectedTypes.join(", ");
        if (!confirm("Will delete " + typeDesc + " layers with fewer than " + thresholdFrames + " frames.\n(Locked layers will be skipped)\nConfirm?")) {
            return;
        }

        app.beginUndoGroup("Delete Short Layers");
        var deletedCount = 0;
        var skippedLocked = 0;
        var indicesToDelete = [];

        // Iterate through layers (mark indices from end to beginning for safe deletion)
        for (var i = 1; i <= comp.numLayers; i++) {
            var layer = comp.layer(i);

            // Skip locked layers
            if (layer.locked) {
                skippedLocked++;
                continue;
            }

            // Determine layer type
            var isText = false, isShape = false, isAdjustment = false,
                isLight = false, isCamera = false;

            // Use matchName for better compatibility
            var mn = layer.matchName;
            if (mn === "ADBE Text Layer") {
                isText = true;
            } else if (mn === "ADBE Vector Layer") {
                isShape = true;
            } else if (mn === "ADBE Light Layer") {
                isLight = true;
            } else if (mn === "ADBE Camera Layer") {
                isCamera = true;
            }

            // Adjustment layer: matchName is usually "ADBE AV Layer", but has an adjustmentLayer property
            if (layer.adjustmentLayer && !isLight && !isCamera) {
                isAdjustment = true; // Overrides shape/text? Adjustment layers cannot be shape/text, so it's safe
            }

            // Check if layer matches type filter
            var typeMatched = allTypes ||
                (isText && selectedTypes.indexOf("text") !== -1) ||
                (isShape && selectedTypes.indexOf("shape") !== -1) ||
                (isAdjustment && selectedTypes.indexOf("adjustment") !== -1) ||
                (isLight && selectedTypes.indexOf("light") !== -1) ||
                (isCamera && selectedTypes.indexOf("camera") !== -1);

            if (!typeMatched) continue;

            // Calculate layer duration (in frames)
            var layerDuration = layer.outPoint - layer.inPoint;
            var frameDuration = comp.frameDuration;
            var durationFrames = layerDuration / frameDuration; // Float frame count

            // Check if duration is less than threshold
            if (durationFrames < thresholdFrames) {
                indicesToDelete.push(i); // Record index
            }
        }

        // Delete from end to beginning to avoid index shifting
        for (var d = indicesToDelete.length - 1; d >= 0; d--) {
            try {
                comp.layer(indicesToDelete[d]).remove();
                deletedCount++;
            } catch (e) {
                // If deletion fails (rare), skip and report
            }
        }
        app.endUndoGroup();

        // Feedback result
        var msg = "Operation complete.\n";
        msg += "Layers deleted: " + deletedCount + "\n";
        if (skippedLocked > 0) {
            msg += "Locked layers skipped: " + skippedLocked;
        }
        alert(msg);
    };

    // Show window
    if (win instanceof Window) {
        win.center();
        win.show();
    } else {
        win.layout.layout(true);
    }
})();