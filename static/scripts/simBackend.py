'''
Description: 
Author: Kotori Y
Date: 2021-06-11 08:43:57
LastEditors: Kotori Y
LastEditTime: 2021-06-11 17:15:45
FilePath: \relationPlot\static\scripts\simBackend.py
AuthorMail: kotori@cbdd.me
'''

import pandas as pd
import json


def getInterDrugs(interTable, query):
    interDrugs, indices = [], []
    # temp_ = inter[inter.level >= l]

    if query in interTable.internalID_a.values:
        t = interTable.xs(query, level=0)
        interDrugs.extend(list(t.index))
        indices.extend(list(t.idx))

    if query in interTable.internalID_b.values:
        t = interTable.xs(query, level=1)
        interDrugs.extend(list(t.index))
        indices.extend(list(t.idx))

    return interDrugs, indices


def getJsonData(interTable, drugsTable, descriptionMap, query):

    # init data
    Name = drugsTable.loc[query].Name
    fakeData = {
        "info": {"id": query, "Name": Name},
        "interactions": []
    }

    interDrugs, indices = getInterDrugs(interTable, query)
    for interDrug, index in zip(interDrugs, indices):

        index = str(index)
        drug = drugsTable.loc[interDrug]

        temp = {
            "id": interDrug,
            "name": drug.Name,
            "level": [descriptionMap[index]["level"]],
            "actions": descriptionMap[index]["actions"]
        }

        fakeData["interactions"].append(temp)

    return fakeData


if "__main__" == __name__:

    interTable = pd.read_csv(r"static/data/interactionsFixed.csv")
    interTable = interTable.set_index(
        ["internalID_a", "internalID_b"],
        drop=False
    )

    drugsTable = pd.read_csv(r"static/data/drugsInfo0606.csv")
    drugsTable = drugsTable.set_index("Internal")

    descriptionMap = json.load(open("static/data/desMap.json"))

    # query = "DDInter1569"
    # query = "DDInter20"
    # # query = "DDInter90"
    query = "DDInter84"
    simData = getJsonData(interTable, drugsTable, descriptionMap, query)

    with open("static/scripts/simData.json", "w") as f_obj:
        json.dump(simData, f_obj)
