// client.js
var React = require('react');
var ReactDOM = require('react-dom');
var Dropzone = require('react-dropzone');
var request = require('superagent');
var baseUri = 'http://localhost:3456';

ReactDOM.render(
    <h1>Hello, world!</h1>,
    document.getElementById('example')
);

var DropzoneDemo = React.createClass({
    onDrop: function(files){
        var req = request.post(baseUri + '/upload');
        files.forEach((file)=> {
            req.attach(file.name, file);
            this.setState({filename: file.name});
        });
        req.end(); // 'callback' goes here.
    },

    render: function () {
        return (
            <div>
                <Dropzone onDrop={this.onDrop}>
                    <div>Enter the dropzone, or click to select.</div>
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
                <Sound filename={sound.filename} id={sound.id} key={sound.id}>
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
                {this.props.filename}
            </div>
        );
    },
    handleClick: function(event) {
        var req = request.post(baseUri + '/play/' + this.props.id);
        req.end(); // 'callback' goes here.
    }
});

ReactDOM.render(
    <SoundBox url="http://localhost:3456/files"/>,
    document.getElementById('sounds')
);

var Kill = React.createClass({
    render: function() {
        return (
            <div onClick={this.handleClick} className="kill">
                Kill
            </div>
        );
    },
    handleClick: function(event) {
        var req = request.post(baseUri + '/kill')
            .send();
        req.end(); // 'callback' goes here.
    }
});

ReactDOM.render(
    <Kill/>,
    document.getElementById('kill')
);
