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
            this.setState({filename: file.name});
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

var SoundBox = React.createClass({
    getInitialState: function() {
        return {data: []};
    },
    componentDidMount: function() {
        req = request.get(this.props.url)
                .end(function (err, res) {
                    this.setState({data: res.body})
                }.bind(this));
    },
    render: function() {
        return (
            <div className="soundBox">
                <SoundList data={this.state.data} />
            </div>
        );
    }
});

var SoundList = React.createClass({
    propTypes: {
        data: React.PropTypes.array.isRequired
    },
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
            <div onClick={this.handleClick} className="sound">
                <h2 className="filename">
                    {this.props.filename}
                </h2>
                {this.props.children}
            </div>
        );
    },
    handleClick: function(event) {
        //console.log(event);
        var req = request.post('http://localhost:3456/play')
            .send({filename: this.props.filename});
        req.end('callback');
        //console.log(this.props);
        //console.log(this.props.filename);
        //console.log(this.props.key);
    }
});

ReactDOM.render(
    <SoundBox url="http://localhost:3456/files"/>,
    document.getElementById('sounds')
);
