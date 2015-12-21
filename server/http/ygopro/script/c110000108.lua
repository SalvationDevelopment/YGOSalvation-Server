--Black Hole Shield
function c110000108.initial_effect(c)
    --Black Hole deflection
	local e1=Effect.CreateEffect(c)
    e1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e1:SetCode(EVENT_ATTACK_ANNOUNCE)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCondition(c110000108.condition2)
	e1:SetCost(c110000108.cost2)
	e1:SetTarget(c110000108.target)
	e1:SetOperation(c110000108.operation2)
	c:RegisterEffect(e1)
	--Restrict Attack
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_CONTINUOUS)
	e2:SetCode(EVENT_ATTACK_ANNOUNCE)
	e2:SetCondition(c110000108.racon)
	e2:SetOperation(c110000108.raop)
	c:RegisterEffect(e2)
    --Attack Redirection
    local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e3:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e3:SetCode(EVENT_BE_BATTLE_TARGET)
	e3:SetCondition(c110000108.arcon)
	e3:SetTarget(c110000108.artar)
	e3:SetOperation(c110000108.arop)
	c:RegisterEffect(e3)
end
function c110000108.datg(e,c)
	return c:IsSetCard(0x3A2E)
end
function c110000108.afilter(c)
    return c:IsSetCard(0x3A2E) and c:IsFaceup()
end
function c110000108.atkfilter(e,c)
    return c:IsSetCard(0x3A2E)
end
function c110000108.condition2(e,tp,eg,ep,ev,re,r,rp)
	local a=Duel.GetAttacker()
	local at=Duel.GetAttackTarget()
	return Duel.GetCurrentPhase()==PHASE_BATTLE and at and not at==e:GetHandler() and at:IsControler(tp) and at:IsOnField() and at:IsSetCard(0x3A2E)
end
function c110000108.cost2(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():IsReleasable() end
	Duel.Release(e:GetHandler(),REASON_COST)
end
function c110000108.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.SetTargetPlayer(tp)
	Duel.SetTargetCard(Duel.GetAttackTarget())
end
function c110000108.operation2(e,tp,eg,ep,ev,re,r,rp)
local at=Duel.GetAttackTarget()
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_INDESTRUCTABLE_BATTLE)
	e1:SetValue(1)
	e1:SetReset(RESET_PHASE+PHASE_END)
	at:RegisterEffect(e1,true)
	local e2=Effect.CreateEffect(e:GetHandler())
	e2:SetType(EFFECT_TYPE_SINGLE)
	e2:SetCode(EFFECT_AVOID_BATTLE_DAMAGE)
	e2:SetValue(1)
	e2:SetReset(RESET_PHASE+PHASE_END)
	at:RegisterEffect(e2,true)
end
function c110000108.valcon(e,re,r,rp)
	return bit.band(r,REASON_BATTLE)~=0
end
function c110000108.arcon(e,tp,eg,ep,ev,re,r,rp)
	return r~=REASON_REPLACE and Duel.GetAttackTarget()==e:GetHandler()
        and Duel.GetAttacker():IsControler(1-tp) and e:GetHandler():GetBattlePosition()~=POS_FACEDOWN_DEFENCE
end
function c110000108.artar(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsControler(tp) and chkc:IsLocation(LOCATION_MZONE) end
	if chk==0 then return Duel.IsExistingMatchingCard(tp,c110000108.afilter,LOCATION_MZONE,0,1,e:GetHandler()) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TARGET)
	Duel.SelectTarget(tp,c110000108.afilter,tp,LOCATION_MZONE,0,1,1,Duel.GetAttackTarget())
end
function c110000108.arop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc and tc:IsRelateToEffect(e) then
		Duel.ChangeAttackTarget(tc)
	end
end
function c110000108.racon(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler()==Duel.GetAttacker()
end
function c110000108.raop(e,tp,eg,ep,ev,re,r,rp)
    local j=e:GetHandler()
	local e9=Effect.CreateEffect(e:GetHandler())
	e9:SetType(EFFECT_TYPE_FIELD)
    e9:SetRange(LOCATION_MZONE)
	e9:SetCode(EFFECT_CANNOT_ATTACK_ANNOUNCE)
	e9:SetTargetRange(LOCATION_MZONE,0)
	e9:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END)
	e9:SetTarget(c110000108.atkfilter)
	j:RegisterEffect(e9)
end