/*
 * @Description:
 * @Author: Kotori Y
 * @Date: 2021-06-11 09:39:25
 * @LastEditors: Kotori Y
 * @LastEditTime: 2021-06-17 09:08:18
 * @FilePath: \relation-graph\static\scripts\renderGraph.js
 * @AuthorMail: kotori@cbdd.me
 */

function genGraph(data, focus = "actions") {
  // String.prototype.capitalize = function () {
  //   return this.charAt(0).toUpperCase() + this.slice(1);
  // };

  const lineColorKey = focus === "actions" ? "level" : "actions";
  let graph = {
    nodes: [],
    links: [],
    categories: [],
  };

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

  // added canetr node (i.g. query drug)
  graph["nodes"].push({
    id: data.info.id,
    name: data.info.Name,
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
        borderColor: "none",
        formatter: `${lineColorKey.toUpperCase()}: ${words} <br \> ${
          data.info.Name
        } <i class="fas fa-arrows-alt-h"></i> <strong>${interaction.name}</strong>`,
        backgroundColor: secondaryNodes[lineColorKey].get(words),
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
        } <i class="fas fa-arrows-alt-h"></i> <strong>${interaction.name}</strong>`,
        backgroundColor: secondaryNodes[lineColorKey].get(words),
        textStyle: {
          color: "white",
        },
      },
      lineStyle: {
        color: secondaryNodes[lineColorKey].get(words),
        width: 1.5,
      },
    });
  }

  // add secondary nodes
  for (const [node, color] of secondaryNodes[focus].entries()) {
    const num = cateCount.get(node, false);
    if (num) {
      graph.categories.push({
        name: node,
        itemStyle: {
          shadowColor: "rgba(0, 0, 0, 0.5)",
          shadowBlur: 10,
          color: secondaryNodes[focus].get(node),
        },
      });
      graph.links.push({
        source: data.info.id,
        target: node,
        lineStyle: { color: secondaryNodes[focus].get(node), width: 3 },
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
          backgroundColor: secondaryNodes[focus].get(node),
          textStyle: {
            color: "white",
          },
        },
      });
    }
  }

  return graph;
}

function render(data, focus = "level") {
  const graph = genGraph(data, focus);
  // console.log(graph);

  var chartDom = document.getElementById("main");
  var myChart = echarts.init(chartDom);
  var option;
  myChart.hideLoading();

  graph.nodes.forEach(function (node) {
    node.label = {
      show: false,
    };
  });

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
        center: ["450", "300"],
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
    ],
  };

  myChart.setOption(option);
  option && myChart.setOption(option);
}
