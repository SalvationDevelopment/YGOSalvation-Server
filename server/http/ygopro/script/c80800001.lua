--ゴゴゴ護符
function c80800001.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	c:RegisterEffect(e1)
	--damage reduce
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_CHANGE_DAMAGE)
	e2:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e2:SetRange(LOCATION_SZONE)
	e2:SetTargetRange(1,0)
	e2:SetCondition(c80800001.damcon)
	e2:SetValue(c80800001.damval)
	c:RegisterEffect(e2)
	--indes
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(80800001,0))
	e3:SetType(EFFECT_TYPE_QUICK_O)
	e3:SetRange(LOCATION_SZONE)
	e3:SetCode(EVENT_ATTACK_ANNOUNCE)
	e3:SetHintTiming(TIMING_BATTLE_PHASE)
	e3:SetCountLimit(1)
	e3:SetCondition(c80800001.condition)
	e3:SetTarget(c80800001.target)
	e3:SetOperation(c80800001.operation)
	c:RegisterEffect(e3)
end
function c80800001.cfilter(c)
	return c:IsFaceup() and c:IsSetCard(0x59)
end
function c80800001.damcon(e,tp,eg,ep,ev,re,r,rp)
	return Duel.IsExistingMatchingCard(c80800001.cfilter,tp,LOCATION_MZONE,0,2,nil)
end
function c80800001.damval(e,re,val,r,rp,rc)
	if bit.band(r,REASON_EFFECT)~=0 then return 0 end
	return val
end
function c80800001.condition(e,tp,eg,ep,ev,re,r,rp)
	local a=Duel.GetAttacker()
	local at=Duel.GetAttackTarget()
	return bit.band(Duel.GetCurrentPhase(),0x38)~=0 and at and ((a:IsControler(tp) and a:IsOnField() and a:IsSetCard(0x59))
		or (at:IsControler(tp) and at:IsOnField() and at:IsFaceup() and at:IsSetCard(0x59)))
end
function c80800001.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.SetTargetCard(Duel.GetAttacker())
	Duel.SetTargetCard(Duel.GetAttackTarget())
end
function c80800001.operation(e,tp,eg,ep,ev,re,r,rp)
	local a=Duel.GetAttacker()
	local at=Duel.GetAttackTarget()
	if at:IsControler(tp) then a,at=at,a end
	if a:IsFacedown() or not a:IsRelateToEffect(e) or not at:IsRelateToEffect(e) 
	or not e:GetHandler():IsRelateToEffect(e)
	then return end
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_INDESTRUCTABLE_BATTLE)
	e1:SetValue(1)
	e1:SetReset(RESET_PHASE+PHASE_DAMAGE)
	a:RegisterEffect(e1,true)
end
