/*
 * @Description:
 * @Author: Kotori Y
 * @Date: 2021-06-11 09:39:25
 * @LastEditors: Kotori Y
 * @LastEditTime: 2021-06-18 09:29:07
 * @FilePath: \relation-graph\static\scripts\renderGraph.js
 * @AuthorMail: kotori@cbdd.me
 */

function genGraphAndPiData(data, focus = "actions") {
  const lineColorKey = focus === "actions" ? "level" : "actions";

  const secondaryNodes = {
    actions: new Map([
      ["absorption", "#B99095"],
      ["distribution", "#74BDCB"],
      ["metabolism", "#FFA384"],
      ["excretion", "#EFE7BC"],
      ["synergistic effect", "#3D5B59"],
      ["antagonistic effect", "#B5E5CF"],
      ["others", "#FCB5AC"],
      ["unknown", "#E7D4C0"],
    ]),
    level: new Map([
      ["Major", "#f9646c"],
      ["Moderate", "#f9a764"],
      ["Minor", "#f964b7"],
      ["Unknown", "#b6b2b2"],
    ]),
  };

  let graph = {
    nodes: [],
    links: [],
    categories: [],
  };

  // init piData
  let piData = [];
  secondaryNodes[focus].forEach((color, name) => {
    const children = [];
    secondaryNodes[lineColorKey].forEach((color, name) => {
      children.push({ name: name, value: 0, itemStyle: { color: color } });
    });
    piData.push({
      name: name,
      itemStyle: { color: color },
      children: children,
    });
  });

  // added canetr node (i.g. query drug)
  graph["nodes"].push({
    id: data.info.id,
    name: data.info.Name,
    symbol: "image:///static/icon/drug_blue.svg",
    symbolSize: 40,
    x: 400,
    y: 200,
    tooltip: {
      formatter: `${data.info.Name}: \t <strong>${data.interactions.length}<strong>`,
    },
  });

  // add third nodes and links
  const cateCount = new Map();
  for (const interaction of data.interactions) {
    let cate = interaction[focus];
    const words = interaction[lineColorKey][0];
    const color_ = secondaryNodes[lineColorKey].get(words);

    cate = typeof cate === "string" ? cate : cate[0];
    cateCount.set(cate, (cateCount.get(cate) | 0) + 1);

    graph.nodes.push({
      id: interaction.id,
      name: interaction.name,
      symbolSize: 8,
      category: cate,
      itemStyle: {
        borderColor: "white",
        borderWidth: 1,
        color: "#3c5db4",
        shadowColor: "rgba(0, 0, 0, 0.5)",
        shadowBlur: 3,
      },
      tooltip: {
        borderColor: color_,
        formatter: `${lineColorKey.toUpperCase()}: ${words} <br \> ${
          data.info.Name
        } <i class="fad fa-repeat"></i> <strong>${interaction.name}</strong>`,
        backgroundColor: color_,
        textStyle: {
          color: "white",
        },
      },
    });

    graph.links.push({
      source: cate,
      target: interaction.id,
      tooltip: {
        formatter: `${lineColorKey.toUpperCase()}: ${words} <br \> ${
          data.info.Name
        } <i class="fad fa-repeat"></i> <strong>${interaction.name}</strong>`,
        backgroundColor: color_,
        textStyle: {
          color: "white",
        },
      },
      lineStyle: {
        color: color_,
        width: 1.5,
      },
    });

    // pi data
    piData
      .find((elem) => elem.name === cate)
      .children.find((elem) => elem.name === words).value += 1;
  }

  // add secondary nodes and complete pi data
  for (const [node, color] of secondaryNodes[focus].entries()) {
    const num = cateCount.get(node, false);
    if (num) {
      graph.categories.push({
        name: node,
        itemStyle: {
          shadowColor: "rgba(0, 0, 0, 0.5)",
          shadowBlur: 10,
          color: color,
        },
      });
      graph.links.push({
        source: data.info.id,
        target: node,
        lineStyle: { color: color, width: 3 },
        value: num,
      });
      graph.nodes.push({
        name: node,
        value: num,
        symbolSize: 30,
        category: node,
        itemStyle: {
          borderColor: "white",
          borderWidth: 5,
          shadowColor: "rgba(0, 0, 0, 0.5)",
          shadowBlur: 5,
          color: color,
        },
        tooltip: {
          formatter: `${node}&nbsp;&nbsp;&nbsp;&nbsp;<strong>{c}</strong>`,
          backgroundColor: color,
          textStyle: {
            color: "white",
          },
        },
        label: {
          show: true,
          fontSize: 14,
          color: color,
          fontFamily: "Fira Code",
        },
      });
    }
  }

  return [graph, piData];
}

function render(data, focus = "level") {
  const [graph, piData] = genGraphAndPiData(data, focus);
  console.log(graph, piData);

  var chartDom = document.getElementById("main");
  var myChart = echarts.init(chartDom);
  var option;
  myChart.hideLoading();

  //   graph.nodes.forEach(function (node) {
  //     node.label = {
  //       show: node.value,
  //     };
  //   });

  option = {
    title: {
      text: graph.nodes[0].name,
      // subtext: "Circular layout",
      top: "top",
      left: "left",
      textStyle: {
        fontSize: 24,
        fontFamily: "Fira Code",
      },
    },
    tooltip: {},
    backgroundColor: "#f6f6f6",
    legend: [
      {
        data: graph.categories.map(function (a) {
          return a.name;
        }),
        type: "scroll",
        // orient: "vertical",
        // right: 1,
        // top: "middle",
        bottom: 0,
        shadowColor: "rgba(0, 0, 0, 0.5)",
        shadowBlur: 10,
        textStyle: {
          fontSize: 18,
          fontFamily: "Fira Code",
        },
        selected: {
          // 选中'系列1'
          Unknown: false,
          unknown: false,
          // 不选中'系列2'
          // '系列2': false
        },
      },
    ],
    // animationDurationUpdate: 1,
    // animationEasingUpdate: "quinticInOut",
    series: [
      {
        name: "Action",
        type: "graph",
        layout: "force",
        draggable: true,
        //   gravity: 0.01,
        center: ["900", "300"],
        //   legendHoverLink: true,
        //   circular: {
        //     rotateLabel: true,
        //   },
        data: graph.nodes,
        links: graph.links,
        categories: graph.categories,
        roam: true,
        label: {
          position: "right",
          formatter: "{b}",
        },
        emphasis: {
          focus: "adjacency",
          lineStyle: {
            width: 10,
          },
        },
        lineStyle: {
          // color: "source",
          curveness: 0.3,
          width: 0.3,
        },
        force: {
          // edgeLength : [5, 100],
          repulsion: (30 / graph.nodes.length) * 180,
          // edgeLength: [40, 300, 200, 100, 100, 100]
          // gravity: 0.08,
          // edgeLength: 200,
        },
        lineStyle: {
          // color: "source",
          curveness: 0.3,
          width: 3,
        },
      },
      {
        type: "sunburst",
        link: false,
        data: piData,
        label: {
          fontFamily: "Fira Code"
        },
        radius: [0, "95%"],
        center: ["75%", "50%"],
        sort: null,
        emphasis: {
          focus: "ancestor",
        },
        levels: [
          {},
          {
            r0: "15%",
            r: "70%",
            itemStyle: {
              borderWidth: 2,
            },
            label: {
              rotate: "radial",
              minAngle: 10,
            },
          },
          {
            r0: "70%",
            r: "72%",
            label: {
              position: "outside",
              padding: 3,
              silent: false,
              minAngle: 1.5,
            },
            itemStyle: {
              borderWidth: 3,
            },
          },
        ],
      },
    ],
  };

  myChart.setOption(option);
  option && myChart.setOption(option);
}
