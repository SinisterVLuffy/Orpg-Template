import React from 'react';

const fs = require('fs');

let path = '.';
let depth = 0;
while (depth < 20 && !fs.existsSync(path + 'map.w3x')) {
  path = path + '../';
}

const LUA_PATH_LOCATION = path + 'map.w3x/war3map.lua';



const ObjectiveType = {
  KILL: 'Kill',
  GATHER: 'Gather',
  DISCOVER: 'Discover',
}

// const data = {
//   "name": "Trouble in Turtle Town",
//   "getQuestFrom": "gg_unit_nvil_0069",
//   "handQuestTo": "gg_unit_nvil_0069",
//   "obtainText": "Yo yo I got a quest for you",
//   "incompleteText": "Yo yo the quest is incomplet yo",
//   "completedText": "Yo yo nice job yo",
//   "rewards": {
//     "exp": 50,
//     "gold": 5,
//     "items": {
//       "6": 5
//     }
//   },
//   "objectives": [
//     {
//       "type": "kill",
//       "amount": 10,
//       "toKill": "hmbs",
//       "name": "Snapping Turtles",
//       "verb": "Exterminate",
//       "verbPast": "exterminated"
//     },
//     {
//       "type": "item",
//       "amount": 10,
//       "itemId": 77
//     }
//   ],
//   "prerequisites": [1, 2],
//   "levelRequirement": 1
// }

function removeA(arr) {
    var what, a = arguments, L = a.length, ax;
    while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax= arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1);
        }
    }
    return arr;
}

class EditQuestDialog extends React.Component {
  state = {
    data: this.props.initialData,
  };

  _getSelectForObjective(selectedOption, onChanged) {
    const objectiveOptions = Object.values(ObjectiveType).map(type => {
      return <option key={type} value={type}>{type}</option>
    });

    return (
      <select value={selectedOption} onChange={onChanged} >
        <option value="unset">Choose an objective type</option>
        {objectiveOptions}
      </select>
    );
  }

  _getSelectForPrerequisite(selectedOption, onChanged) {
    const prerequisiteOptions = Object.entries(this.props.existingQuests).map(entry => {
      return <option key={entry[0]} value={entry[0]}>{entry[1].name}</option>
    });

    return (
      <select value={selectedOption} onChange={onChanged} >
        {prerequisiteOptions}
      </select>
    );
  }

  _onSave = () => {
    this.props.onSave(this.state.data, this.props.id);
  };

  _onChangeSimpleValue = (key, event) => {
    const oldData = Object.assign({}, this.state.data);
    oldData[key] = event.target.value;
    this.setState({
      data: oldData,
    });
  };

  _onChangeNestedValue = (key, subkey, event) => {
    const oldData = Object.assign({}, this.state.data);
    if (oldData[key] == null) {
      oldData[key] = {};
    }
    oldData[key][subkey] = event.target.value;
    this.setState({
      data: oldData,
    });
  };

  _onAddObjective = () => {
    const oldData = Object.assign({}, this.state.data);
    const oldObjectives = oldData.objectives ? [...oldData.objectives] : [];

    oldObjectives.push({});
    oldData.objectives = oldObjectives;
    this.setState({
      data: oldData,
    });
  };

  _onObjectiveChanged = (key, field, event) => {
    const oldData = Object.assign({}, this.state.data);
    const oldObjectives = oldData.objectives ? [...oldData.objectives] : [];
    oldObjectives[key][field] = event.target.value;
    oldData.objectives = oldObjectives;
    this.setState({
      data: oldData,
    });
  };

  _onRemoveObjective = (key) => {
    const oldData = Object.assign({}, this.state.data);
    const oldObjectives = oldData.objectives ? [...oldData.objectives] : [];
    oldObjectives.splice(key, 1);
    oldData.objectives = oldObjectives;
    this.setState({
      data: oldData,
    });
  };

  _onAddPrerequisite = () => {
    const oldData = Object.assign({}, this.state.data);
    const oldPrereqs = oldData.prerequisites ? [...oldData.prerequisites] : [];
    oldPrereqs.push(1);
    oldData.prerequisites = oldPrereqs;
    this.setState({
      data: oldData,
    });
  };

  _onChangePrerequisite = (key, event) => {
    const oldData = Object.assign({}, this.state.data);
    const oldPrereqs = oldData.prerequisites ? [...oldData.prerequisites] : [];
    oldPrereqs[key] = event.target.value;
    oldData.prerequisites = oldPrereqs;
    this.setState({
      data: oldData,
    });
  };

  _onRemovePrerequisite = (key) => {
    const oldData = Object.assign({}, this.state.data);
    const oldPrereqs = oldData.prerequisites ? [...oldData.prerequisites] : [];
    oldPrereqs.splice(key, 1);
    oldData.prerequisites = oldPrereqs;
    this.setState({
      data: oldData,
    });
  };

  render() {
    const luaContents = fs.readFileSync(LUA_PATH_LOCATION, {encoding: 'utf8'});

    const validUnits = Array.from(new Set(luaContents.match(/gg_unit_[a-zA-Z0-9]{4}_\d{4}/g)));
    const validRegions = Array.from(new Set(luaContents.match(/gg_rct_[a-zA-Z0-9_]+/g)));

    const unitFullMatch = luaContents.match(/BlzCreateUnitWithSkin\(p, FourCC\(\"([a-zA-Z0-9]{4})\"\)/g);
    const unitIds = unitFullMatch.map(x => {
      return x.substring(33, 37);
    });
    const validUnitIds = Array.from(new Set(unitIds));

    const validUnitOptions = Object.values(validUnits).map(unitGlobal => {
      return <option key={unitGlobal} value={unitGlobal}>{unitGlobal}</option>
    });

    const validUnitIdOptions = Object.values(validUnitIds).map(unitId => {
      return <option key={unitId} value={unitId}>{unitId}</option>
    });

    const validItemOptions = Object.entries(this.props.existingItems).map(entry => {
      const itemId = entry[0];
      const itemName = entry[1].name;
      return <option key={itemId} value={itemId}>{itemName}</option>
    });

    const validRegionOptions = Object.values(validRegions).map(regionGlobal => {
      return <option key={regionGlobal} value={regionGlobal}>{regionGlobal}</option>
    });

    const objectiveInfo = this.state.data.objectives || [];
    const objectives = objectiveInfo.map((entry, idx) => {
      let objectiveSpecificFields = null;
      if (entry.type === ObjectiveType.KILL) {
        objectiveSpecificFields = (
          <span>
            <input name="amount" type="number" placeholder="Amount" value={this.state.data.objectives[idx].amount} onChange={this._onObjectiveChanged.bind(this, idx, 'amount')} />
            <select name="toKill" type="text" placeholder="toKill" value={this.state.data.objectives[idx].toKill} onChange={this._onObjectiveChanged.bind(this, idx, 'toKill')}>
              <option value="unset">Choose a unit</option>
              {validUnitIdOptions}
            </select>
            <input name="name" type="text" placeholder="Name (plural if multiple amount)" value={this.state.data.objectives[idx].name} onChange={this._onObjectiveChanged.bind(this, idx, 'name')} />
            <input name="verb" type="text" placeholder="Verb (Optional)" value={this.state.data.objectives[idx].verb} onChange={this._onObjectiveChanged.bind(this, idx, 'verb')} />
            <input name="verbPast" type="text" placeholder="Verb Past (Optional)" value={this.state.data.objectives[idx].verbPast} onChange={this._onObjectiveChanged.bind(this, idx, 'verbPast')} />
          </span>
        );
      } else if (entry.type === ObjectiveType.GATHER) {
        objectiveSpecificFields = (
          <span>
            <input name="amount" type="number" placeholder="Amount" value={this.state.data.objectives[idx].amount} onChange={this._onObjectiveChanged.bind(this, idx, 'amount')} />
            <select name="itemId" type="text" placeholder="itemId" value={this.state.data.objectives[idx].itemId} onChange={this._onObjectiveChanged.bind(this, idx, 'itemId')}>
              <option value="unset">Choose an item</option>
              {validItemOptions}
            </select>
          </span>
        );
      } else if (entry.type === ObjectiveType.DISCOVER) {
        objectiveSpecificFields = (
          <span>
            <input name="name" type="text" placeholder="Name" value={this.state.data.objectives[idx].name} onChange={this._onObjectiveChanged.bind(this, idx, 'name')} />
            <select name="region" type="text" placeholder="region" value={this.state.data.objectives[idx].region} onChange={this._onObjectiveChanged.bind(this, idx, 'region')}>
              <option value="unset">Choose a region</option>
              {validRegionOptions}
            </select>
          </span>
        );
      }

      return (
        <div className="objective" key={idx}>
          {this._getSelectForObjective(entry.type, this._onObjectiveChanged.bind(this, idx, 'type'))}

          {objectiveSpecificFields}

          <button className="destructive" onClick={this._onRemoveObjective.bind(this, idx)}>Remove</button>
        </div>
      );
    });

    const preReqInfo = this.state.data.prerequisites || [];
    const prerequisites = preReqInfo.map((entry, idx) => {
      return (
        <div key={idx}>
          {this._getSelectForPrerequisite(entry, this._onChangePrerequisite.bind(this, idx))}
          <button className="destructive" onClick={this._onRemovePrerequisite.bind(this, idx)}>Remove</button>
        </div>
      );
    });

    return (
      <div className="editDialog">
        <div>
          <label htmlFor="levelRequirement">Quest Name:</label>
          <input type="text" placeholder="Quest Name" value={this.state.data.name} onChange={this._onChangeSimpleValue.bind(this, 'name')} />
        </div>
        <div>
          <label htmlFor="levelRequirement">Receive Quest From:</label>
          <select name="getQuestFrom" value={this.state.data.getQuestFrom} onChange={this._onChangeSimpleValue.bind(this, 'getQuestFrom')}>
            <option value="unset">Choose a quest giver</option>
            {validUnitOptions}
          </select>
        </div>
        <div>
          <label htmlFor="levelRequirement">Hand Quest To:</label>
          <select name="handQuestTo" value={this.state.data.handQuestTo} onChange={this._onChangeSimpleValue.bind(this, 'handQuestTo')}>
            <option value="unset">Choose who to hand the quest to</option>
            {validUnitOptions}
          </select>
        </div>
        <div>
          <label htmlFor="levelRequirement">Required Level: </label>
          <input name="levelRequirement" type="number" placeholder="Required Level" value={this.state.data.levelRequirement} onChange={this._onChangeSimpleValue.bind(this, 'levelRequirement')} />
        </div>
        <div>
          <label htmlFor="obtainText">Obtain Text: </label>
          <textarea name="obtainText" placeholder="Obtain Text" value={this.state.data.obtainText} onChange={this._onChangeSimpleValue.bind(this, 'obtainText')} />
        </div>
        <div>
          <label htmlFor="incompleteText">Incomplete Text: </label>
          <textarea name="incompleteText" placeholder="Incomplete Text" value={this.state.data.incompleteText} onChange={this._onChangeSimpleValue.bind(this, 'incompleteText')} />
        </div>
        <div>
          <label htmlFor="completedText">Complete Text: </label>
          <textarea name="completedText" placeholder="Complete Text" value={this.state.data.completedText} onChange={this._onChangeSimpleValue.bind(this, 'completedText')} />
        </div>
        <div>
          <label htmlFor="exp">Exp Reward: </label>
          <input name="exp" type="number" placeholder="Exp Reward" value={this.state.data.rewards && this.state.data.rewards.exp} onChange={this._onChangeNestedValue.bind(this, 'rewards', 'exp')} />
        </div>
         <div>
          <label htmlFor="gold">Gold Reward: </label>
          <input name="gold" type="number" placeholder="Gold Reward" value={this.state.data.rewards && this.state.data.rewards.gold} onChange={this._onChangeNestedValue.bind(this, 'rewards', 'gold')} />
        </div>

        <hr />
        <h3>Prerequisites</h3>
        {prerequisites}
        <button onClick={this._onAddPrerequisite}>Add a Prerequisite Quest</button>
        <hr />
        <h3>Objectives</h3>
        {objectives}
        <button onClick={this._onAddObjective}>Add an objective</button>
        <hr />
        <button className="neutral" onClick={this.props.onCancel}>Cancel</button>
        <button onClick={this._onSave}>Save</button>
      </div>
    );
  }
}

export default EditQuestDialog;
