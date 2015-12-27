// main.js
var React = require('react');
var ReactDOM = require('react-dom');
var Dropzone = require('react-dropzone');
var request = require('superagent');

ReactDOM.render(
<h1>Hello, world!</h1>,
    document.getElementById('example')
);

var DropzoneDemo = React.createClass({
    onDrop: function(files){
        // TODO: Make the server a configurable param.
        var req = request.post('http://localhost:3456/upload');
        files.forEach((file)=> {
            req.attach(file.name, file);
        });
        req.end('');
    },

    render: function () {
        return (
            <div>
                <Dropzone onDrop={this.onDrop}>
                    <div>Try dropping some files here, or click to select files to upload.</div>
                </Dropzone>
            </div>
        );
    }
});

ReactDOM.render(<DropzoneDemo />, document.getElementById('dropzone'));
