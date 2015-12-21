--ゴーストリック・ハウス
function c80600062.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	c:RegisterEffect(e1)
	--Cannot atk facedowns
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_CANNOT_BE_BATTLE_TARGET)
	e2:SetTargetRange(LOCATION_MZONE,LOCATION_MZONE)
	e2:SetProperty(EFFECT_FLAG_SET_AVAILABLE)
	e2:SetTarget(aux.TargetBoolFunction(Card.IsFacedown))
	e2:SetValue(1)
	e2:SetRange(LOCATION_SZONE)
	c:RegisterEffect(e2)
	--Attack directly
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_FIELD)
	e3:SetRange(LOCATION_SZONE)
	e3:SetTargetRange(LOCATION_MZONE,LOCATION_MZONE)
	e3:SetCode(EFFECT_DIRECT_ATTACK)
	e3:SetCondition(c80600062.atkcon)
	c:RegisterEffect(e3)
	--half dmg
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_FIELD)
	e4:SetRange(LOCATION_SZONE)
	e4:SetCode(EFFECT_CHANGE_DAMAGE)
	e4:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e4:SetTargetRange(1,1)
	e4:SetValue(c80600062.damval)
	c:RegisterEffect(e4)
end
function c80600062.filter(c)
	return c:IsFaceup()
end
function c80600062.atkcon(e)
	local player=Duel.GetTurnPlayer()
	return Duel.GetMatchingGroup(c80600062.filter,1-player,LOCATION_MZONE,0,nil):GetCount()==0
end
function c80600062.damval(e,re,dam,r,rp,rc)
	if rc and rc:IsSetCard(0x91) then
		return dam
	else return dam/2 end
end
function c80600062.dmgcon(c)
	local player=Duel.GetTurnPlayer()
	return Duel.GetMatchingGroup(c80600062.filter,1-player,LOCATION_MZONE,0,nil):GetCount()==0
end