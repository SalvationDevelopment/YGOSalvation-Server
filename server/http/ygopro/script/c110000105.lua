--Trap Buster
function c110000105.initial_effect(c)
	--disable
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_DISABLE)
	e1:SetRange(LOCATION_MZONE)
	e1:SetTargetRange(LOCATION_SZONE,0)
	e1:SetTarget(c110000105.distg)
	c:RegisterEffect(e1)
	--disable effect
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
	e2:SetCode(EVENT_CHAIN_SOLVING)
	e2:SetRange(LOCATION_MZONE)
	e2:SetOperation(c110000105.disop)
	c:RegisterEffect(e2)
	--self destroy
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_FIELD)
	e3:SetCode(EFFECT_SELF_DESTROY)
	e3:SetRange(LOCATION_MZONE)
	e3:SetTargetRange(LOCATION_SZONE,0)
	e3:SetTarget(c110000105.distg)
	c:RegisterEffect(e3)
	--Restrict Attack
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_CONTINUOUS)
	e4:SetCode(EVENT_ATTACK_ANNOUNCE)
	e4:SetCondition(c110000105.racon)
	e4:SetOperation(c110000105.raop)
	c:RegisterEffect(e4)
    --Attack Redirection
    local e5=Effect.CreateEffect(c)
	e5:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e5:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e5:SetCode(EVENT_BE_BATTLE_TARGET)
	e5:SetCondition(c110000105.arcon)
	e5:SetTarget(c110000105.artar)
	e5:SetOperation(c110000105.arop)
	c:RegisterEffect(e5)
end
function c110000105.cfilter(c,tp)
	return c:IsFaceup() and c:IsSetCard(0x3A2E) and c:IsControler(tp) and c:IsLocation(LOCATION_MZONE)
end
function c110000105.distg(e,re)
	local c=e:GetOwner()
	return e:GetHandler():GetControler()~=c:GetControler() and c:IsType(TYPE_TRAP)
end
function c110000105.disop(e,tp,eg,ep,ev,re,r,rp)
	if not re:IsActiveType(TYPE_TRAP) then return end
	if not re:IsHasProperty(EFFECT_FLAG_CARD_TARGET) then return end
	local g=Duel.GetChainInfo(ev,CHAININFO_TARGET_CARDS)
	if not g or not g:IsExists(c110000105.cfilter,1,nil,tp) then return end
	Duel.NegateEffect(ev)
	if re:GetHandler():IsRelateToEffect(re) then
		Duel.Destroy(re:GetHandler(),REASON_EFFECT)
	end
end
function c110000105.afilter(c)
    return c:IsSetCard(0x3A2E) and c:IsFaceup()
end
function c110000105.atkfilter(e,c)
    return c:IsSetCard(0x3A2E)
end
function c110000105.arcon(e,tp,eg,ep,ev,re,r,rp)
	return r~=REASON_REPLACE and Duel.GetAttackTarget()==e:GetHandler()
        and Duel.GetAttacker():IsControler(1-tp) and e:GetHandler():GetBattlePosition()~=POS_FACEDOWN_DEFENCE
end
function c110000105.artar(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsControler(tp) and chkc:IsLocation(LOCATION_MZONE) end
	if chk==0 then return Duel.IsExistingMatchingCard(c110000105.afilter,tp,LOCATION_MZONE,0,1,e:GetHandler()) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TARGET)
	Duel.SelectTarget(tp,c110000105.afilter,tp,LOCATION_MZONE,0,1,1,Duel.GetAttackTarget())
end
function c110000105.arop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc and tc:IsRelateToEffect(e) then
		Duel.ChangeAttackTarget(tc)
	end
end
function c110000105.racon(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler()==Duel.GetAttacker()
end
function c110000105.raop(e,tp,eg,ep,ev,re,r,rp)
    local j=e:GetHandler()
	local e9=Effect.CreateEffect(e:GetHandler())
	e9:SetType(EFFECT_TYPE_FIELD)
    e9:SetRange(LOCATION_MZONE)
	e9:SetCode(EFFECT_CANNOT_ATTACK_ANNOUNCE)
	e9:SetTargetRange(LOCATION_MZONE,0)
	e9:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END)
	e9:SetTarget(c110000105.atkfilter)
	j:RegisterEffect(e9)
end