local Vector = require('src/vector.lua')
local threat = require('src/threat.lua')

local Turtle = {}

function Turtle:new(o)
    o = o or {}
    setmetatable(o, self)
    self.__index = self
    return o
end

function Turtle:getName()
    return "Giant Turtle"
end

-- Counter-clockwise coords
function Turtle:getBounds()
    return false
end

function Turtle:spawnAdds()
    for i=0,2,1 do
        local bossV = Vector:new{
            x = GetUnitX(self.bossUnit),
            y = GetUnitY(self.bossUnit),
        }
        local spawnLocation = Vector:fromAngle(GetRandomReal(0, 2 * bj_PI))
            :multiply(50)
            :add(bossV)
        local add = CreateUnit(
            Player(PLAYER_NEUTRAL_AGGRESSIVE),
            FourCC("hmbs"),
            spawnLocation.x,
            spawnLocation.y,
            GetRandomReal(0, 180))

        local targetHero = self.ctx:getRandomInvolvedHero()
        threat.addThreat(targetHero, add, 100)
    end
end

function Turtle:castSlam()
    IssueImmediateOrder(self.bossUnit, "thunderclap")
end

function Turtle:init()
    local phase1 = self.ctx:registerPhase{
        hp = 100,
    }

    self.ctx:registerDoor(gg_dest_YTcx_4753)
end

return Turtle
