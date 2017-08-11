/*
Copyright 2016 Capital One Services, LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

import React,{Component} from 'react'
import {Text as ReactText}  from 'react-native'
import Svg,{ Circle, G, Line, Path, Polygon, Text } from 'react-native-svg'
import { Colors, Options, fontAdapt, cyclic, color, identity } from './util'
import _ from 'lodash'
import Axis from './Axis'

import 'babel-polyfill'

const Bar = require('paths-js/bar')

export default class BarChart extends Component {

  static defaultProps = {
    accessorKey:'',
    options: {
      width: 600,
      height: 600,
      margin: {top: 20, left: 20, bottom: 50, right: 20},
      color: '#2980B9',
      gutter: 20,
      animate: {
        type: 'oneByOne',
        duration: 200,
        fillTransition: 3
      },
      axisX: {
        showAxis: true,
        showLines: true,
        showLabels: true,
        showTicks: true,
        zeroAxis: false,
        orient: 'bottom',
        label: {
          fontFamily: 'Arial',
          fontSize: 14,
          bold: true,
          color: '#34495E'
        }
      },
      axisY: {
        showAxis: true,
        showLines: true,
        showLabels: true,
        showTicks: true,
        zeroAxis: false,
        orient: 'left',
        label: {
          fontFamily: 'Arial',
          fontSize: 14,
          bold: true,
          color: '#34495E'
        }
      }
    }
  }

  color(i) {
    let color = this.props.options.color
    if (!_.isString(this.props.options.color)) color = color.color
    const pallete = this.props.pallete || Colors.mix(color || '#9ac7f7')
    return Colors.string(cyclic(pallete, i))
  }

  getMaxAndMin(values, scale) {
    let maxValue = 0
    let minValue = 0

    let max = _.max(values)
    if (max > maxValue) maxValue = max
    let min = _.min(values)
    if (min < minValue) minValue = min

    return {
      minValue: minValue,
      maxValue: maxValue,
      min: scale(minValue),
      max: scale(maxValue)
    }
  }

  render() {
    const { maxScore, peer, score } = this.props

    const noDataMsg = this.props.noDataMessage || 'No data available'
    if (this.props.data === undefined) return (<ReactText>{noDataMsg}</ReactText>)

    let options = new Options(this.props)
    let accessor = this.props.accessor || identity(this.props.accessorKey)

    let chart = Bar({
      data: this.props.data,
      gutter: this.props.options.gutter || 10,
      width: options.chartWidth,
      height: options.chartHeight,
      accessor: accessor
    })

    let max = null, value = null
    let values = chart.curves.map((curve) => {
      if(((curve.item && curve.item.v) || 0) > max) {
        max = curve.item.v
      }

      value = accessor(curve.item)
      return value
    })
    values.push(maxScore)
    let chartArea = {x: {minValue: 0, maxValue: 200, min: 0, max: options.chartWidth},
                     y: this.getMaxAndMin(values, chart.scale),
                     margin:options.margin}

    let textStyle = fontAdapt(options.axisX.label)
    let labelOffset = this.props.options.axisX.label.offset || 20
    let labelStyle = fontAdapt(options.label)

    let label = {
      position: null,
      score: [],
      peer: []
    }
    let lines = chart.curves.map(function (c, i) {
      let color = this.color(i % 3)
      if(chart.curves.length <= (i + 1)) {
        color = 'transparent'
      }

      // let stroke = Colors.darkenColor(color)
      let yLabel = (options.chartHeight - ((c.item.v / max) * options.chartHeight)) - 70

      if(options.label && options.label.text && i === options.label.position) {
        label['position'] = (
          <G scale="1" x={c.line.centroid[0] - 45} y={yLabel}>
            <G>
              <Polygon
                  points="0,5 5,0 65,0 70,5 70,30 65,35 40,35 35,40 30,35 5,35, 0,30"
                  fill={options.label.backgroundColor}
                  stroke={options.label.strokeColor}
                  strokeWidth="0.1"
              />
            </G>
            <G x={59} y={8}>
              <Text
                fontFamily={labelStyle.fontFamily}
                fontSize={labelStyle.fontSize}
                fontWeight={labelStyle.fontWeight}
                fontStyle={labelStyle.fontStyle}
                fill={labelStyle.fill}
                textAnchor="end">
                {options.label.text}
              </Text>
            </G>
            <G x={74} y={40}>
              <Circle
                cx="-39"
                cy="15"
                r="8"
                stroke={options.label.circleStrokeColor}
                strokeWidth={options.label.circleStrokeWidth}
                fill={options.label.circleFillColor}
              />
            </G>
          </G>
        )
      }

      if(score && score[i]) {
        let yPosition = (options.chartHeight - ((score[i] / maxScore) * options.chartHeight))

        label['score'].push(
          <G key={'score'+i} x={c.line.centroid[0]} y={yPosition}>
            <Circle
              cx="-10"
              cy="0"
              r="8"
              stroke={(this.props.options.score && this.props.options.score.color) || '#E8AF3C'}
              strokeWidth={(this.props.options.score && this.props.options.score.stroke) || 8}
              fill={(this.props.options.score && this.props.options.score.fill) || 'transparent'}
            />
          </G>
        )
      }

      if(peer && peer[i]) {
        let yPosition = (options.chartHeight - ((peer[i] / maxScore) * options.chartHeight))

        label['peer'].push(
          <G key={'peer'+i} x={c.line.centroid[0]} y={yPosition}>
            <Line
              x1="-18"
              y1="-8"
              x2="-2"
              y2="8"
              stroke={(this.props.options.peer && this.props.options.peer.color) || "red"}
              strokeWidth={(this.props.options.peer && this.props.options.peer.stroke) || "6"}
            />
            <Line
              x1="-2"
              y1="-8"
              x2="-18"
              y2="8"
              stroke={(this.props.options.peer && this.props.options.peer.color) || "red"}
              strokeWidth={(this.props.options.peer && this.props.options.peer.stroke) || "6"}
            />
          </G>
        )
      }

      return (
                <G key={'lines' + i} x={-10}>
                    <Path d={ c.line.path.print() } fill={color}/>
                    {options.axisX.showLabels ?
                        <Text fontFamily={textStyle.fontFamily}
                          fontSize={textStyle.fontSize} fontWeight={textStyle.fontWeight} fontStyle={textStyle.fontStyle}
                          fill={textStyle.fill} x={c.line.centroid[0]} y={labelOffset + chartArea.y.min}
                          originX={c.line.centroid[0]} originY={labelOffset + chartArea.y.min} rotate={textStyle.rotate}
                          textAnchor="middle">
                          {c.item.name}
                        </Text>
                    : null}
                </G>
            )
    }, this)

    return (<Svg width={options.width} height={options.height}>
              <G x={options.margin.left} y={options.margin.top}>
                <Axis scale={chart.scale} options={options.axisY} chartArea={chartArea} />
                <G x={20}>
                  <G x={10} y={-40}>
                    <G>
                      <Circle
                        cx="-10"
                        cy={0}
                        r="8"
                        stroke={(this.props.options.score && this.props.options.score.color) || '#E8AF3C'}
                        strokeWidth={(this.props.options.score && this.props.options.score.stroke) || 8}
                        fill={(this.props.options.score && this.props.options.score.fill) || 'transparent'}
                      />
                      <Text
                        fontFamily={textStyle.fontFamily}
                        fontSize={this.props.options.score && this.props.options.score.fontSize || 14}
                        fontWeight={(this.props.options.score && this.props.options.score.fontWeight) || false}
                        fill={this.props.options.score && this.props.options.score.fontColor || '#000000'}
                        x={52}
                        y={(this.props.options.score && this.props.options.score.fontSize || 14) - 24}
                        textAnchor="middle">
                        {(this.props.options.score && this.props.options.score.detail) || ' '}
                      </Text>
                    </G>
                    <G x={120}>
                      <Line
                        x1="-18"
                        y1="-8"
                        x2="-2"
                        y2="8"
                        stroke={(this.props.options.peer && this.props.options.peer.color) || "red"}
                        strokeWidth={(this.props.options.peer && this.props.options.peer.stroke) || "6"}
                      />
                      <Line
                        x1="-2"
                        y1="-8"
                        x2="-18"
                        y2="8"
                        stroke={(this.props.options.peer && this.props.options.peer.color) || "red"}
                        strokeWidth={(this.props.options.peer && this.props.options.peer.stroke) || "6"}
                      />
                      <Text
                        fontFamily={textStyle.fontFamily}
                        fontSize={this.props.options.peer && this.props.options.peer.fontSize || 14}
                        fontWeight={(this.props.options.peer && this.props.options.peer.fontWeight) || false}
                        fill={this.props.options.peer && this.props.options.peer.fontColor || '#000000'}
                        x={90}
                        y={(this.props.options.peer && this.props.options.peer.fontSize || 14) - 24}
                        textAnchor="middle">
                        {(this.props.options.peer && this.props.options.peer.detail) || ' '}
                      </Text>
                    </G>
                  </G>
                  {lines}
                  {label['score']}
                  {label['peer']}
                  {label['position']}
                </G>
              </G>
            </Svg>)
  }
}
