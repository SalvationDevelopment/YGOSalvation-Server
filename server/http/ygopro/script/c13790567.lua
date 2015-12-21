--Double Magical Arm Bind
function c13790567.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_CONTROL)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCost(c13790567.cost)
	e1:SetTarget(c13790567.target)
	e1:SetOperation(c13790567.activate)
	c:RegisterEffect(e1)
end
function c13790567.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.CheckReleaseGroup(tp,nil,2,nil) end
	local sg=Duel.SelectReleaseGroup(tp,nil,2,2,nil)
	Duel.Release(sg,REASON_COST)
end
function c13790567.filter(c,e)
	return c:IsFaceup() and c:IsControlerCanBeChanged()
end
function c13790567.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_SZONE) and c13790567.filter(chkc,e) end
	if chk==0 then return Duel.IsExistingTarget(c13790567.filter,tp,0,LOCATION_MZONE,2,nil) end
	local g=Duel.GetMatchingGroup(c13790567.filter,tp,0,LOCATION_MZONE,nil,e)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_DESTROY)
	local sg=g:Select(tp,2,2,nil)
	Duel.SetTargetCard(sg)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,sg,2,0,0)
end
function c13790567.activate(e,tp,eg,ep,ev,re,r,rp)
	local tc1=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS)
	local tc=tc1:GetFirst()
	while tc do
		if Duel.GetControl(tc,tp,PHASE_END,1) then
		elseif not tc:IsImmuneToEffect(e) and tc:IsAbleToChangeControler() then
			Duel.Destroy(tc,REASON_EFFECT)
		end
		tc=tc1:GetNext()
	end
end
