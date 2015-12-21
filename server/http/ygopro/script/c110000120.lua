--Double Cloth Armor FIXED EDITION NYA
function c110000120.initial_effect(c)
    --Restrict Attack
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e1:SetCode(EVENT_BATTLE_END)
	e1:SetCondition(c110000120.racon)
	e1:SetOperation(c110000120.raop)
	c:RegisterEffect(e1)
    --Attack Redirection
    local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e2:SetCode(EVENT_BE_BATTLE_TARGET)
	e2:SetCondition(c110000120.arcon)
	e2:SetTarget(c110000120.artar)
	e2:SetOperation(c110000120.arop)
	c:RegisterEffect(e2)
    --Cannot Attack
    local e3=Effect.CreateEffect(c)
    e3:SetType(EFFECT_TYPE_SINGLE)
	e3:SetCode(EFFECT_CANNOT_ATTACK)
    c:RegisterEffect(e3)
    --Burst
    local e4=Effect.CreateEffect(c)
    e4:SetCategory(CATEGORY_DESTROY+CATEGORY_DAMAGE)
	e4:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e4:SetCode(EVENT_PRE_DAMAGE_CALCULATE)
	e4:SetCondition(c110000120.pbcon)
    e4:SetTarget(c110000120.pbtar)
	e4:SetOperation(c110000120.pbop)
	c:RegisterEffect(e4)
end
function c110000120.pbcon(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler()==Duel.GetAttackTarget() and Duel.GetAttacker()
end
function c110000120.pbtar(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	local tc=Duel.GetAttacker()
        local se=e:GetHandler()
        local num=tc:GetAttack()/2
	Duel.SetTargetCard(tc)
        Duel.SetTargetCard(se)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,tc,1,0,0)
        Duel.SetOperationInfo(0,CATEGORY_DESTROY,se,1,0,0)
       	Duel.SetOperationInfo(0,CATEGORY_DAMAGE,nil,0,1-tp,num)
end
function c110000120.pbop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetAttacker()
        local se=e:GetHandler()
        local num=tc:GetAttack()/2
	if not tc:IsRelateToBattle() or tc:IsFacedown() then return end
	Duel.Destroy(tc,REASON_EFFECT)
        Duel.Destroy(se,REASON_EFFECT)
        Duel.Damage(1-tp,num,REASON_EFFECT)
end
function c110000120.afilter(c)
    return c:IsSetCard(0x3A2E) and c:IsFaceup()
end
function c110000120.atkfilter(e,c)
    return c:IsSetCard(0x3A2E)
end
function c110000120.arcon(e,tp,eg,ep,ev,re,r,rp)
	return r~=REASON_REPLACE and Duel.GetAttackTarget()==e:GetHandler()
        and Duel.GetAttacker():IsControler(1-tp) and e:GetHandler():GetBattlePosition()~=POS_FACEDOWN_DEFENCE
end
function c110000120.artar(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsControler(tp) and chkc:IsLocation(LOCATION_MZONE) end
	if chk==0 then return Duel.IsExistingMatchingCard(c110000120.afilter,tp,LOCATION_MZONE,0,1,e:GetHandler()) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TARGET)
	Duel.SelectTarget(tp,c110000120.afilter,tp,LOCATION_MZONE,0,1,1,Duel.GetAttackTarget())
end
function c110000120.arop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc and tc:IsRelateToEffect(e) then
		Duel.ChangeAttackTarget(tc)
	end
end
function c110000120.racon(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler()==Duel.GetAttacker()
end
function c110000120.raop(e,tp,eg,ep,ev,re,r,rp)
    local j=e:GetHandler()
	local e9=Effect.CreateEffect(e:GetHandler())
	e9:SetType(EFFECT_TYPE_FIELD)
    e9:SetRange(LOCATION_MZONE)
	e9:SetCode(EFFECT_CANNOT_ATTACK_ANNOUNCE)
	e9:SetTargetRange(LOCATION_MZONE,0)
	e9:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END)
	e9:SetTarget(c110000120.atkfilter)
	j:RegisterEffect(e9)
end