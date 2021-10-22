import powerbi from "powerbi-visuals-api";
import DialogConstructorOptions = powerbi.extensibility.visual.DialogConstructorOptions;
import DialogAction = powerbi.DialogAction;
import * as d3 from "d3";

export class TestDialog {
    static id = "MyTestDialog";
    private svg: d3.Selection<HTMLSelectElement, unknown, null, undefined>;
    private host;
    constructor(options: DialogConstructorOptions, initialState: object) {
        this.host = options.host;
        var data = ["Option 1", "Option 2", "Option 3"];

        this.svg = d3.select(options.element)
                        .append('select')
                            .attr('class','select')
                            .on('change',onchange)
        
        var options2 = this.svg
        .selectAll('option')
            .data(data).enter()
            .append('option')
                .text(function (d) { return d; });
        
        function onchange() {
            var selectValue = d3.select('select').property('value')
            this.host.setResult({ result: selectValue });
        };

        // … dialog rendering implementation …
        /*
        const div = document.createElement('div');
        div.className = 'test';
        let text = document.createTextNode('Test');
        div.appendChild(text);
        
        const form = document.createElement("INPUT");
        form.setAttribute("type","text");
        div.appendChild(form);
        this.target.appendChild(div);
        */
        //this.
    }
}

export class TestDialogResult {
    result: string;
}

globalThis.dialogRegistry = globalThis.dialogRegistry || {};
globalThis.dialogRegistry[TestDialog.id] = TestDialog;
