--Performance Band Hurricane
function c13790673.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DESTROY)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCountLimit(1,13790673)
	e1:SetTarget(c13790673.target)
	e1:SetOperation(c13790673.activate)
	c:RegisterEffect(e1)
end
function c13790673.filter(c)
	return c:IsAbleToHand()
end
function c13790673.cfilter(c)
	return c:IsFaceup() and c:IsSetCard(0x9f)
end
function c13790673.target(e,tp,eg,ep,ev,re,r,rp,chk)
	local c=e:GetHandler()
	if chk==0 then
		local ct=Duel.GetMatchingGroupCount(c13790673.cfilter,tp,LOCATION_MZONE,0,nil)
		e:SetLabel(ct)
		return Duel.IsExistingMatchingCard(c13790673.filter,tp,0,LOCATION_ONFIELD,ct,c)
	end
	local ct=e:GetLabel()
	local sg=Duel.GetMatchingGroup(c13790673.filter,tp,0,LOCATION_ONFIELD,c)
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,sg,ct,0,0)
end
function c13790673.activate(e,tp,eg,ep,ev,re,r,rp)
	local ct=Duel.GetMatchingGroupCount(c13790673.cfilter,tp,LOCATION_MZONE,0,nil)
	local g=Duel.GetMatchingGroup(c13790673.filter,tp,0,LOCATION_ONFIELD,e:GetHandler())
	if g:GetCount()>=ct then
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_DESTROY)
		local sg=g:Select(tp,1,ct,nil)
		Duel.HintSelection(sg)
		Duel.SendtoHand(sg,nil,REASON_EFFECT)
	end
end
