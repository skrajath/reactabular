'use strict';

var React = require('react/addons');
var _formatters = require('./formatters');
var _predicates = require('./predicates');

module.exports = React.createClass({
    getDefaultProps() {
        return {
            strategy: _predicates.prefix
        };
    },

    render() {
        var columns = this.props.columns || [];
        var options = [{
            value: 'all',
            name: 'All'
        }].concat(columns.map((column) => {
            if(column.property && column.header) {
                return {
                    value: column.property,
                    name: column.header
                };
            }
        }).filter(id));

        return <span className='search'>
            <select ref='column' onChange={this.change}>{options.map((option) =>
                <option key={option.value + '-option'} value={option.value}>{option.name}</option>
            )
            }</select>
            <input ref='query' onChange={this.change}></input>
        </span>;
    },

    change(e) {
        var query = this.refs.query.getDOMNode().value;
        var column = this.refs.column.getDOMNode().value;

        this.search(query, column);
    },

    search(query, column) {
        if(!this.props.columns) {
            return;
        }

        var data = this.props.data || [];
        var columns = this.props.columns;
        var formatters = this.props.formatters || {};

        if(column !== 'all') {
            columns = this.props.columns.filter((col) =>
                col.property === column
            );
        }

        (this.props.onResult || noop)({
            search: {
                data: data.filter((row) =>
                    columns.filter(isColumnVisible.bind(this, row)).length > 0
                ),
                query: query,
            }
        });

        function isColumnVisible(row, col) {
            var property = col.property;
            var formatter = formatters[property] || _formatters.identity;
            var value = row[property];
            var formattedValue = formatter(value);

            if (!formattedValue) {
                return false;
            }

            if(formattedValue.toLowerCase) {
                var predicate = this.props.strategy(query.toLowerCase());

                return predicate.matches(formattedValue.toLowerCase());
            }
        }
    },
});

function id(a) {return a;}
function noop() {}
