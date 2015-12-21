--Burning Knuckle
function c110000111.initial_effect(c)
    --Restrict Attack
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_CONTINUOUS)
	e1:SetCode(EVENT_ATTACK_ANNOUNCE)
	e1:SetCondition(c110000111.racon)
	e1:SetOperation(c110000111.raop)
	c:RegisterEffect(e1)
    --Attack Redirection
    local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e2:SetCode(EVENT_BE_BATTLE_TARGET)
	e2:SetCondition(c110000111.arcon)
	e2:SetTarget(c110000111.artar)
	e2:SetOperation(c110000111.arop)
	c:RegisterEffect(e2)
    --gains 200 ATK for each armor monster
    local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_SINGLE)
	e3:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e3:SetRange(LOCATION_MZONE)
	e3:SetCode(EFFECT_UPDATE_ATTACK)
	e3:SetValue(c110000111.atkup)
	c:RegisterEffect(e3)
    local e5=Effect.CreateEffect(c)
	e5:SetCategory(CATEGORY_ATKCHANGE)
	e5:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e5:SetCode(EVENT_BATTLED)
	e5:SetCondition(c110000111.rbcon)
	e5:SetOperation(c110000111.rbop)
	c:RegisterEffect(e5)
end
function c110000111.rbcon(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler()==Duel.GetAttacker() and Duel.GetAttackTarget()
end
function c110000111.rbop(e,tp,eg,ep,ev,re,r,rp)
	local d=Duel.GetAttackTarget()
    local val=e:GetHandler():GetAttack()
	if not d:IsRelateToBattle() or d:IsFacedown() then return end
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_UPDATE_ATTACK)
	e1:SetValue(-val)
	e1:SetReset(RESET_EVENT+0x1fe0000)
	d:RegisterEffect(e1)
end
function c110000111.atkup(e,c)
        local num=Duel.GetMatchingGroupCount(c110000111.filter,c:GetControler(),LOCATION_MZONE,0,nil)
        return num*200
end
function c110000111.filter(c)
    return c:IsSetCard(0x3A2E) and c:IsFaceup()
end
function c110000111.atkfilter(e,c)
    return c:IsSetCard(0x3A2E)
    end
function c110000111.arcon(e,tp,eg,ep,ev,re,r,rp)
	return r~=REASON_REPLACE and Duel.GetAttackTarget()==e:GetHandler()
        and Duel.GetAttacker():IsControler(1-tp) and e:GetHandler():GetBattlePosition()~=POS_FACEDOWN_DEFENCE
end
function c110000111.artar(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsControler(tp) and chkc:IsLocation(LOCATION_MZONE) end
	if chk==0 then return Duel.IsExistingMatchingCard(c110000111.filter,tp,LOCATION_MZONE,0,1,e:GetHandler()) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TARGET)
	Duel.SelectTarget(tp,c110000111.filter,tp,LOCATION_MZONE,0,1,1,Duel.GetAttackTarget())
end
function c110000111.arop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc and tc:IsRelateToEffect(e) then
		Duel.ChangeAttackTarget(tc)
	end
end
function c110000111.racon(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler()==Duel.GetAttacker()
end
function c110000111.raop(e,tp,eg,ep,ev,re,r,rp)
    local j=e:GetHandler()
	local e9=Effect.CreateEffect(e:GetHandler())
	e9:SetType(EFFECT_TYPE_FIELD)
    e9:SetRange(LOCATION_MZONE)
	e9:SetCode(EFFECT_CANNOT_ATTACK_ANNOUNCE)
	e9:SetTargetRange(LOCATION_MZONE,0)
	e9:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END)
	e9:SetTarget(c110000111.atkfilter)
	j:RegisterEffect(e9)
end