// client.js
var React = require('react');
var ReactDOM = require('react-dom');
var request = require('superagent');
var config = require('./config.json');

ReactDOM.render(
    <h1>Edit Pancake All The Things</h1>,
    document.getElementById('header')
);

var SoundBox = React.createClass({
    getInitialState: function () {
        return {data: []};
    },
    componentDidMount: function () {
        this.getFiles();
    },
    getFiles: function () {
        req = request.get(this.props.url)
            .end(function (err, res) {
                this.setState({data: res.body})
            }.bind(this));
    },
    render: function () {
        return (
            <div className="soundBox">
                <SoundEditList data={this.state.data}/>
            </div>
        );
    }
});

var SoundEditList = React.createClass({
    propTypes: {
        data: React.PropTypes.array.isRequired
    },
    render: function () {
        var soundNodes = this.props.data.map(function (sound) {
            return (
                <Sound key={sound.id}>
                    {sound}
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
    render: function () {
        return (
	    <textarea onChange={this.handleChange} className="sound" value={JSON.stringify(this.props.children, null, 2)}>
            </textarea>
        );
    },
    handleChange: function (event) {
        // var req = request.post(baseUri + '/play/' + this.props.id);
	console.log(event);
        req.end(); // 'callback' goes here.
    }
});

ReactDOM.render(
    <SoundBox url={config.host + '/files'}/>,
    document.getElementById('edit')
);
