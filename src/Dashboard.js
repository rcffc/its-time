import React, { Component } from "react";
import { Collapse, Timeline, Icon, Row, Col, PageHeader } from "antd";
import "antd/dist/antd.css";
import "./Dashboard.css";
import Walk from "./assets/icons/walk.svg";
import Bus from "./assets/icons/bus.svg";
import Tram from "./assets/icons/tram.svg";
import Train from "./assets/icons/train.svg";
import Subway from "./assets/icons/subway.svg";

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      departure: "Pohjoinen Rautatiekatu 25",
      arrival: "Liusketie 3"
    };

    this.fireRequest();
    setInterval(() => {
      this.fireRequest();
    }, 60000);
  }

  fireRequest() {
    const api =
      "https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql";

    const request = `
      {
        plan(
          from: {lat: 60.169403, lon: 24.925805},
          to: {lat: 60.234504, lon: 25.012588}
          numItineraries: 6
        ) {
          itineraries {
            legs {
              startTime
              endTime
              mode
              duration
              realTime
              distance
              from {
                name
                stop {
                  code
                }
              },
              to {
                name
                stop {
                  code
                }
              }
            }
          }
        }
      }
    `;

    const reqParams = {
      headers: {
        "content-type": "application/graphql; charset=UTF-8"
      },
      body: request,
      method: "POST"
    };

    fetch(api, reqParams)
      .then(data => {
        return data.json();
      })
      .then(res => {
        this.setState({ response: res });
      })
      .catch(error => console.log(error));
  }

  getDisplayTime(timestamp) {
    let date = new Date(timestamp);
    let hours = date.getHours();
    let minutes = "0" + date.getMinutes();
    let formattedTime = hours + ":" + minutes.substr(-2);
    return formattedTime;
  }

  getDisplayDistance(distance) {
    return Math.ceil(distance / 100) / 10;
  }

  getDisplayDuration(duration) {
    return Math.ceil(duration / 60);
  }

  getDisplayMode(mode) {
    switch (mode) {
      case "WALK":
        return <Icon component={Walk} />;
      case "BUS":
        return <Icon component={Bus} />;
      case "TRAM":
        return <Icon component={Tram} />;
      case "TRAIN":
        return <Icon component={Train} />;
      case "SUBWAY":
        return <Icon component={Subway} />;
      default:
        return null;
    }
  }

  getTripDuration(trip) {
    return trip.legs.map(leg => leg.duration).reduce((a, b) => a + b);
  }

  getDeparture(dep) {
    if (dep.name === "Origin") return this.state.departure;
    else return dep.name + " [E" + dep.stop.code + "]";
  }

  getArrival(arr) {
    if (arr.name === "Destination") return this.state.arrival;
    else return arr.name + " [E" + arr.stop.code + "]";
  }

  render() {
    const { Panel } = Collapse;

    let collapse;

    if (this.state.response) {
      collapse = (
        <div>
          {this.state.response.data.plan.itineraries.map((it, it_index) => (
            <Collapse accordion defaultActiveKey={["0"]}>
              <Panel
                header={
                  this.getDisplayTime(it.legs[0].startTime) +
                  "\u{2192}" +
                  this.getDisplayTime(it.legs[0].endTime) +
                  " (" +
                  this.getDisplayDuration(this.getTripDuration(it)) +
                  "min)"
                }
                key={it_index}
              >
                <Timeline>
                  {it.legs.map((l, leg_index) => (
                    <Timeline.Item key={leg_index}>
                      <Row>
                        <Col span={2}>{this.getDisplayMode(l.mode)} </Col>
                        <Col span={3}>
                          <Row>{this.getDisplayTime(l.startTime)}</Row>
                          <Row>{this.getDisplayTime(l.endTime)}</Row>
                        </Col>
                        <Col span={11}>
                          <Row>{this.getDeparture(l.from)}</Row>
                          <Row>{this.getArrival(l.to)}</Row>
                        </Col>

                        <Col span={4}>
                          {this.getDisplayDuration(l.duration)} min
                        </Col>
                        <Col span={4}>
                          {this.getDisplayDistance(l.distance)} km
                        </Col>
                      </Row>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Panel>
            </Collapse>
          ))}
        </div>
      );
    } else {
      collapse = <div></div>;
    }

    return (
      <div>
        <PageHeader
          style={{
            border: "1px solid rgb(235, 237, 240)"
          }}
          title="It's Time to Leave"
          subTitle="From Pohjoinen Rautatiekatu 25 To Liusketie 3"
        />
        {collapse}
      </div>
    );
  }
}

export default Dashboard;
