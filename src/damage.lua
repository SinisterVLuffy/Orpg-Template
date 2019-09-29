local buff = require('src/buff.lua')
local threat = require('src/threat.lua')

function createCombatText(text, target, green)
    local targetSize = BlzGetUnitCollisionSize(target)

    local tag = CreateTextTag()
    SetTextTagText(tag, I2S(S2I(text)), TextTagSize2Height(targetSize * 0.04 + 6) * 1.2)
    SetTextTagPosUnit(tag, target, 7)
    if green then
        SetTextTagColor(tag, 0, 100, 0, 0)
    else
        SetTextTagColor(tag, 100, 0, 0, 0)
    end
    SetTextTagVelocity(
        tag,
        TextTagSpeed2Velocity(GetRandomReal(-70, 70)),
        TextTagSpeed2Velocity(70))
    SetTextTagPermanent(tag, false)
    SetTextTagLifespan(tag, 0.5)
    SetTextTagFadepoint(tag, 0.01)

    TimerStart(CreateTimer(), 0.5, false, function()
        DestroyTextTag(tag)
        DestroyTimer(GetExpiredTimer())
    end)
end

function dealDamage(source, target, amount)
    UnitDamageTargetBJ(
        source, target, amount, ATTACK_TYPE_NORMAL, DAMAGE_TYPE_UNIVERSAL)
end

function heal(source, target, amount)
    local curHealth = BlzGetUnitRealField(target, UNIT_RF_HP)
    local modifiedAmt = buff.getModifiedHealing(source, target, amount)
    local newHealth = curHealth + modifiedAmt

    BlzSetUnitRealField(
        target,
        UNIT_RF_HP,
        newHealth)

    createCombatText(modifiedAmt, target, true)

    -- TODO feed into threat system
end

function onDamageTaken()
    local source = GetEventDamageSource()
    local target = GetTriggerUnit()
    local amount = buff.getModifiedDamage(source, target, GetEventDamage())
    BlzSetEventDamage(amount)
    createCombatText(amount, target, false)
    threat.addThreat(source, target, amount)
    buff.maybeRemoveBuffsOnDamage(source, target, amount)
end

function init()
    local trigger = CreateTrigger()
    for i=0,bj_MAX_PLAYERS,1 do
        TriggerRegisterPlayerUnitEvent(
            trigger, Player(i), EVENT_PLAYER_UNIT_DAMAGED, nil)
    end
    TriggerAddAction(trigger, onDamageTaken)
end

return {
    init = init,
    dealDamage = dealDamage,
    heal = heal,
}
