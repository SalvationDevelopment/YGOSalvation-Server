--Buster Knuckle
function c110000109.initial_effect(c)
    --Restrict Attack
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_CONTINUOUS)
	e1:SetCode(EVENT_ATTACK_ANNOUNCE)
	e1:SetCondition(c110000109.racon)
	e1:SetOperation(c110000109.raop)
	c:RegisterEffect(e1)
    --Attack Redirection
    local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e2:SetCode(EVENT_BE_BATTLE_TARGET)
	e2:SetCondition(c110000109.arcon)
	e2:SetTarget(c110000109.artar)
	e2:SetOperation(c110000109.arop)
	c:RegisterEffect(e2)
    --Piercing
    local e3=Effect.CreateEffect(c)
    e3:SetType(EFFECT_TYPE_SINGLE)
	e3:SetCode(EFFECT_PIERCE)
    c:RegisterEffect(e3)
    --Summon Restriction
    local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_SINGLE)
	e4:SetCode(EFFECT_CANNOT_FLIP_SUMMON)
	e4:SetCondition(c110000109.operation)
	c:RegisterEffect(e4)
	local e5=e4:Clone()
	e5:SetCode(EFFECT_CANNOT_SPECIAL_SUMMON)
	c:RegisterEffect(e5)
	local e6=e4:Clone()
	e6:SetCode(EFFECT_CANNOT_SUMMON)
	c:RegisterEffect(e6)
    --ATK Boost
    local e7=Effect.CreateEffect(c)
    e7:SetType(EFFECT_TYPE_SINGLE)
	e7:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e7:SetRange(LOCATION_MZONE)
	e7:SetCode(EFFECT_UPDATE_ATTACK)
	e7:SetValue(c110000109.atkup)
	c:RegisterEffect(e7)
end
function c110000109.atkup(e,c)
        local num=Duel.GetMatchingGroupCount(c110000109.filter,c:GetControler(),LOCATION_MZONE,0,nil)
        return num*200
end
function c110000109.operation(e)
	return Duel.GetMatchingGroupCount(c110000109.filter,e:GetHandlerPlayer(),LOCATION_MZONE,0,nil)==0
end
function c110000109.filter(c)
    return c:IsSetCard(0x3A2E) and c:IsFaceup()
end
function c110000109.atkfilter(e,c)
    return c:IsSetCard(0x3A2E)
end
function c110000109.arcon(e,tp,eg,ep,ev,re,r,rp)
	return r~=REASON_REPLACE and Duel.GetAttackTarget()==e:GetHandler()
        and Duel.GetAttacker():IsControler(1-tp) and e:GetHandler():GetBattlePosition()~=POS_FACEDOWN_DEFENCE
end
function c110000109.artar(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsControler(tp) and chkc:IsLocation(LOCATION_MZONE) end
	if chk==0 then return Duel.IsExistingMatchingCard(c110000109.filter,tp,LOCATION_MZONE,0,1,e:GetHandler()) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TARGET)
	Duel.SelectTarget(tp,c110000109.filter,tp,LOCATION_MZONE,0,1,1,Duel.GetAttackTarget())
end
function c110000109.arop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc and tc:IsRelateToEffect(e) then
		Duel.ChangeAttackTarget(tc)
	end
end
function c110000109.racon(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler()==Duel.GetAttacker()
end
function c110000109.raop(e,tp,eg,ep,ev,re,r,rp)
    local j=e:GetHandler()
	local e9=Effect.CreateEffect(e:GetHandler())
	e9:SetType(EFFECT_TYPE_FIELD)
    e9:SetRange(LOCATION_MZONE)
	e9:SetCode(EFFECT_CANNOT_ATTACK_ANNOUNCE)
	e9:SetTargetRange(LOCATION_MZONE,0)
	e9:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END)
	e9:SetTarget(c110000109.atkfilter)
	j:RegisterEffect(e9)
end