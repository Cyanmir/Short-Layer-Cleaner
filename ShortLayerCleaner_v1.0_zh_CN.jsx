(function () {
    // 检查是否有活动合成
    var comp = app.project.activeItem;
    if (!comp || !(comp instanceof CompItem)) {
        alert("请先选择一个合成（CompItem）。");
        return;
    }

    // 构建 UI
    var win = (this instanceof Panel) ?
        this :
        new Window("palette", "自定义删除图层", undefined, { resizeable: false });
    win.orientation = "column";
    win.alignChildren = ["fill", "top"];
    win.spacing = 8;
    win.margins = 12;

    // --- 图层类型筛选 ---
    var typeGroup = win.add("panel", undefined, "图层类型（不勾选 = 全部类型）");
    typeGroup.orientation = "column";
    typeGroup.alignChildren = "left";
    typeGroup.spacing = 4;

    var chkText = typeGroup.add("checkbox", undefined, "文字图层");
    var chkShape = typeGroup.add("checkbox", undefined, "形状图层");
    var chkAdj = typeGroup.add("checkbox", undefined, "调整图层");
    var chkLight = typeGroup.add("checkbox", undefined, "灯光");
    var chkCamera = typeGroup.add("checkbox", undefined, "摄像机");

    // --- 阈值输入 ---
    var thresholdGroup = win.add("group");
    thresholdGroup.orientation = "row";
    thresholdGroup.alignChildren = ["center", "center"];
    thresholdGroup.spacing = 6;
    thresholdGroup.add("statictext", undefined, "删除小于");
    var editFrames = thresholdGroup.add("edittext", undefined, "1");
    editFrames.characters = 6;
    thresholdGroup.add("statictext", undefined, "帧的图层");

    // --- 按钮 ---
    var btnGroup = win.add("group");
    btnGroup.orientation = "row";
    btnGroup.alignChildren = ["center", "center"];
    btnGroup.spacing = 10;

    var btnDelete = btnGroup.add("button", undefined, "删除图层");
    var btnClose = btnGroup.add("button", undefined, "关闭");

    // --- 事件处理 ---
    btnClose.onClick = function () {
        win.close();
    };

    btnDelete.onClick = function () {
        // 读取阈值
        var thresholdFrames = parseFloat(editFrames.text);
        if (isNaN(thresholdFrames) || thresholdFrames < 0) {
            alert("请输入有效的非负帧数值。");
            return;
        }

        // 收集选中的类型
        var selectedTypes = [];
        if (chkText.value) selectedTypes.push("text");
        if (chkShape.value) selectedTypes.push("shape");
        if (chkAdj.value) selectedTypes.push("adjustment");
        if (chkLight.value) selectedTypes.push("light");
        if (chkCamera.value) selectedTypes.push("camera");

        var allTypes = (selectedTypes.length === 0); // 未勾选任何项则处理所有图层

        // 确认操作
        var typeDesc = allTypes ? "所有" : selectedTypes.join("、");
        if (!confirm("将删除 " + typeDesc + " 图层中帧数小于 " + thresholdFrames + " 的图层。\n（跳过锁定图层）\n确定继续？")) {
            return;
        }

        app.beginUndoGroup("删除短图层");
        var deletedCount = 0;
        var skippedLocked = 0;
        var indicesToDelete = [];

        // 遍历图层（从后往前标记索引，便于删除）
        for (var i = 1; i <= comp.numLayers; i++) {
            var layer = comp.layer(i);

            // 跳过锁定的图层
            if (layer.locked) {
                skippedLocked++;
                continue;
            }

            // 判断图层类型
            var isText = false, isShape = false, isAdjustment = false,
                isLight = false, isCamera = false;

            // 使用 matchName 提高兼容性
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

            // 调整图层：matchName 通常是 "ADBE AV Layer"，但有一个属性 adjustmentLayer
            if (layer.adjustmentLayer && !isLight && !isCamera) {
                isAdjustment = true; // 覆盖形状/文字？调整图层不可能是形状/文字，所以安全
            }

            // 检查是否符合类型筛选
            var typeMatched = allTypes ||
                (isText && selectedTypes.indexOf("text") !== -1) ||
                (isShape && selectedTypes.indexOf("shape") !== -1) ||
                (isAdjustment && selectedTypes.indexOf("adjustment") !== -1) ||
                (isLight && selectedTypes.indexOf("light") !== -1) ||
                (isCamera && selectedTypes.indexOf("camera") !== -1);

            if (!typeMatched) continue;

            // 计算图层持续时间（帧数）
            var layerDuration = layer.outPoint - layer.inPoint;
            var frameDuration = comp.frameDuration;
            var durationFrames = layerDuration / frameDuration; // 浮点帧数

            // 判断是否小于阈值
            if (durationFrames < thresholdFrames) {
                indicesToDelete.push(i); // 记录索引
            }
        }

        // 从后往前删除，避免索引错乱
        for (var d = indicesToDelete.length - 1; d >= 0; d--) {
            try {
                comp.layer(indicesToDelete[d]).remove();
                deletedCount++;
            } catch (e) {
                // 如果删除失败（极少情况），跳过并报告
            }
        }
        app.endUndoGroup();

        // 反馈结果
        var msg = "操作完成。\n";
        msg += "删除图层数：" + deletedCount + "\n";
        if (skippedLocked > 0) {
            msg += "跳过锁定图层：" + skippedLocked;
        }
        alert(msg);
    };

    // 显示窗口
    if (win instanceof Window) {
        win.center();
        win.show();
    } else {
        win.layout.layout(true);
    }
})();