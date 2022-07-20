import * as React from "react";
import { useTransition, animated } from "react-spring";
import "./App.css";

const bins = {
  foo: [58, 43, 56, 49, 25, 10, 32, 29, 11, 90],
  bar: [33, 65, 42, 15, 48, 64, 68, 89, 70],
  baz: [5, 83, 76, 90, 21, 74, 37, 96, 52, 35, 6],
};

const metrics: Array<keyof typeof bins> = ["foo", "bar", "baz"];

const width = 500;
let dimensions = {
  width: width,
  height: width * 0.6,
  margin: {
    top: 30,
    right: 10,
    bottom: 50,
    left: 50,
  },
  boundedWidth: 0,
  boundedHeight: 0,
};

dimensions.boundedWidth =
  dimensions.width - dimensions.margin.left - dimensions.margin.right;
dimensions.boundedHeight =
  dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

function App() {
  const [metricIdx, setMetricIdx] = React.useState(0);
  const metric = metrics[metricIdx];

  const yScale = (binValue: number) =>
    dimensions.boundedHeight + binValue * (-dimensions.boundedHeight / 100);
  const heightScale = (binValue: number) =>
    (binValue / 100) * dimensions.boundedHeight;

  const barPadding = 1;
  const barWidth =
    dimensions.boundedWidth / bins[metric].length -
    barPadding * bins[metric].length;

  function changeMetric() {
    setMetricIdx((metricIdx + 1) % metrics.length);
  }

  //* Now trying to apply React-Spring's Transition API:
  const transitions = useTransition(bins[metric], {
    from: {
      barY: dimensions.boundedHeight,
      barHeight: 0,
      textY: dimensions.boundedHeight,
      fill: "#588dfd",
    },
    enter: (bin) => [
      {
        barY: dimensions.boundedHeight,
        barHeight: 0,
        textY: dimensions.boundedHeight,
        //? Entering bins should start with green fill color
        fill: "#63fd58",
      },
      {
        barY: yScale(bin),
        barHeight: heightScale(bin),
        textY: yScale(bin) - 5,
      },
      //? Entering bins should change to blue fill color after height animation ends
      {
        fill: "#588dfd",
      },
    ],
    leave: [
      //? Leaving bins should turn red before animating out
      { fill: "#fd5869" },
      {
        barY: dimensions.boundedHeight,
        barHeight: 0,
        textY: dimensions.boundedHeight,
      },
    ],
    delay: 200,
    keys: (bin) => `${metric}-${bin}`,
    exitBeforeEnter: true,
  });

  return (
    <div className="container">
      <div id="wrapper">
        <svg width={dimensions.width} height={dimensions.height}>
          <g
            style={{
              transform: `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`,
            }}
          >
            <g className="bins">
              {/* OLD: Without Transitions */}
              {/* {bins[metric].map((bin, idx) => (
                <g className="bin" key={idx}>
                  <rect
                    x={(barWidth + barPadding) * idx}
                    y={yScale(bin)}
                    data-value={bin}
                    width={barWidth}
                    height={heightScale(bin)}
                    fill="cornflowerblue"
                  />
                  <text
                    x={(barWidth + barPadding) * idx + barWidth / 2}
                    y={yScale(bin) - 5}
                    textAnchor="middle"
                  >
                    {bin}
                  </text>
                </g>
              ))} */}
              {/* NEW: With Transitions */}
              {transitions(({ barY, barHeight, fill, textY }, bin, _, idx) => (
                <g className="bin" data-width={(barWidth + barPadding) * idx}>
                  <animated.rect
                    x={(barWidth + barPadding) * idx}
                    // y={barY.get()}
                    width={barWidth}
                    // height={barHeight.get()}
                    style={{
                      y: barY,
                      height: barHeight,
                      fill: fill,
                    }}
                    // fill="cornflowerblue"
                  />
                  <animated.text
                    x={(barWidth + barPadding) * idx + barWidth / 2}
                    style={{
                      y: textY,
                    }}
                    textAnchor="middle"
                  >
                    {bin}
                  </animated.text>
                </g>
              ))}
            </g>
          </g>
        </svg>
      </div>
      <button onClick={changeMetric}>Change metric</button>
    </div>
  );
}

export default App;

