// client.js
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
        req.end('callback');
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

var data = [
    {id: 1, filename: "Pete Hunt", created: "1/1/1"}
];

var SoundBox = React.createClass({
    render: function() {
        return (
            <div className="soundBox">
                <SoundList data={this.props.data} />
            </div>
        );
    }
});

var SoundList = React.createClass({
    render: function() {
        var soundNodes = this.props.data.map(function(sound) {
            return (
                <Sound filename={sound.filename} key={sound.id}>
                    {sound.created}
                </Sound>
            );
        });
        return (
            <div className="soundList">
                {soundNodes}
            </div>
        );
    }
});

var Sound = React.createClass({
    render: function() {
        return (
            <div className="sound">
                <h2 className="filename">
                    {this.props.filename}
                </h2>
                {this.props.children}
            </div>
        );
    }
});

ReactDOM.render(
    <SoundBox data={data} url="localhost:3456/files"/>,
    document.getElementById('sounds')
);
