--極星宝レーヴァテイン
function c1221.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DESTROY)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetTarget(c1221.target)
	e1:SetOperation(c1221.activate)
	c:RegisterEffect(e1)
	if not c1221.global_check then
		c1221.global_check=true
		local ge=Effect.CreateEffect(c)
		ge:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
		ge:SetCode(EVENT_BATTLE_DESTROYING)
		ge:SetOperation(c1221.checkop)
		Duel.RegisterEffect(ge,0)
	end
end
function c1221.checkop(e,tp,eg,ep,ev,re,r,rp)
	local tc=eg:GetFirst()
	while tc do
		if tc:IsFaceup() and tc:IsRelateToBattle() then
			tc:RegisterFlagEffect(1221,RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END,0,1)
		end
		tc=eg:GetNext()
	end
end
function c1221.filter(c)
	return c:IsFaceup() and c:GetFlagEffect(1221)~=0 and c:IsDestructable()
end
function c1221.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and c1221.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c1221.filter,tp,LOCATION_MZONE,LOCATION_MZONE,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_DESTROY)
	local g=Duel.SelectTarget(tp,c1221.filter,tp,LOCATION_MZONE,LOCATION_MZONE,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,g,1,0,0)
	Duel.SetChainLimit(aux.FALSE)
end
function c1221.activate(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsFaceup() and tc:IsRelateToEffect(e) then
		Duel.Destroy(tc,REASON_EFFECT)
	end
end
