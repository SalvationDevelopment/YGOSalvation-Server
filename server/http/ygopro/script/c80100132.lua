--霊獣の連契
function c80100132.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DESTROY)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCondition(c80100132.condition)
	e1:SetTarget(c80100132.target)
	e1:SetOperation(c80100132.activate)
	c:RegisterEffect(e1)
end
function c80100132.cfilter(c)
	return c:IsFaceup() and c:IsSetCard(0xb5)
end
function c80100132.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.IsExistingMatchingCard(c80100132.cfilter,tp,LOCATION_MZONE,0,1,nil)
end
function c80100132.filter(c)
	return c:IsFaceup() and c:IsDestructable()
end
function c80100132.target(e,tp,eg,ep,ev,re,r,rp,chk)
	local c=e:GetHandler()
	if chk==0 then
		local ct=Duel.GetMatchingGroupCount(c80100132.cfilter,tp,LOCATION_MZONE,0,nil)
		e:SetLabel(ct)
		return Duel.IsExistingMatchingCard(c80100132.filter,tp,LOCATION_MZONE,LOCATION_MZONE,ct,c)
	end
	local ct=e:GetLabel()
	local sg=Duel.GetMatchingGroup(c80100132.filter,tp,LOCATION_MZONE,LOCATION_MZONE,c)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,sg,1,0,0)
end
function c80100132.activate(e,tp,eg,ep,ev,re,r,rp)
	local ct=Duel.GetMatchingGroupCount(c80100132.cfilter,tp,LOCATION_MZONE,0,nil)
	local g=Duel.GetMatchingGroup(c80100132.filter,tp,LOCATION_MZONE,LOCATION_MZONE,e:GetHandler())
	if g:GetCount()>=0 then
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_DESTROY)
		local sg=g:Select(tp,1,ct,nil)
		Duel.HintSelection(sg)
		Duel.Destroy(sg,REASON_EFFECT)
	end
end
