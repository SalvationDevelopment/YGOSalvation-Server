--Jet Gauntlet
function c110000107.initial_effect(c)
	--destroy
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(110000107,0))
	e1:SetCategory(CATEGORY_DESTROY)
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e1:SetCode(EVENT_BATTLE_START)
	e1:SetTarget(c110000107.target)
	e1:SetOperation(c110000107.operation)
	c:RegisterEffect(e1)
	--Restrict Attack
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_CONTINUOUS)
	e2:SetCode(EVENT_ATTACK_ANNOUNCE)
	e2:SetCondition(c110000107.racon)
	e2:SetOperation(c110000107.raop)
	c:RegisterEffect(e2)
    --Attack Redirection
    local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e3:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e3:SetCode(EVENT_BE_BATTLE_TARGET)
	e3:SetCondition(c110000107.arcon)
	e3:SetTarget(c110000107.artar)
	e3:SetOperation(c110000107.arop)
	c:RegisterEffect(e3)
end
function c110000107.target(e,tp,eg,ep,ev,re,r,rp,chk)
	local c=e:GetHandler()
	if chk==0 then return Duel.GetAttackTarget()==c or (Duel.GetAttacker()==c and Duel.GetAttackTarget()~=nil) end
	local g=Group.FromCards(Duel.GetAttacker(),Duel.GetAttackTarget())
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,g,g:GetCount(),0,0)
end
function c110000107.operation(e,tp,eg,ep,ev,re,r,rp)
	local g=Group.CreateGroup()
	local c=Duel.GetAttacker()
	if c:IsRelateToBattle() then g:AddCard(c) end
	c=Duel.GetAttackTarget()
	if c~=nil and c:IsRelateToBattle() then g:AddCard(c) end
	if g:GetCount()>0 then
		Duel.Destroy(g, nil, REASON_EFFECT)
	end
end
function c110000107.cboperation(e,tp,eg,ep,ev,re,r,rp)
	Duel.ChangeAttackTarget(e:GetHandler())
end
function c110000107.afilter(c)
    return c:IsSetCard(0x3A2E) and c:IsFaceup()
end
function c110000107.atkfilter(e,c)
    return c:IsSetCard(0x3A2E)
end
function c110000107.arcon(e,tp,eg,ep,ev,re,r,rp)
	return r~=REASON_REPLACE and Duel.GetAttackTarget()==e:GetHandler()
        and Duel.GetAttacker():IsControler(1-tp) and e:GetHandler():GetBattlePosition()~=POS_FACEDOWN_DEFENCE
end
function c110000107.artar(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsControler(tp) and chkc:IsLocation(LOCATION_MZONE) end
	if chk==0 then return Duel.IsExistingMatchingCard(c110000107.afilter,tp,LOCATION_MZONE,0,1,e:GetHandler()) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TARGET)
	Duel.SelectTarget(tp,c110000107.afilter,tp,LOCATION_MZONE,0,1,1,Duel.GetAttackTarget())
end
function c110000107.arop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc and tc:IsRelateToEffect(e) then
		Duel.ChangeAttackTarget(tc)
	end
end
function c110000107.racon(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler()==Duel.GetAttacker()
end
function c110000107.raop(e,tp,eg,ep,ev,re,r,rp)
    local j=e:GetHandler()
	local e9=Effect.CreateEffect(e:GetHandler())
	e9:SetType(EFFECT_TYPE_FIELD)
    e9:SetRange(LOCATION_MZONE)
	e9:SetCode(EFFECT_CANNOT_ATTACK_ANNOUNCE)
	e9:SetTargetRange(LOCATION_MZONE,0)
	e9:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END)
	e9:SetTarget(c110000107.atkfilter)
	j:RegisterEffect(e9)
end