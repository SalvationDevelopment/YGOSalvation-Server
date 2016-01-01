--Hidden Shot
function c15609017.initial_effect(c)
--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DESTROY)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCost(c15609017.cost)
	e1:SetTarget(c15609017.target)
	e1:SetOperation(c15609017.activate)
	c:RegisterEffect(e1)
end
function c15609017.costfilter(c,e,tp)
	return c:IsSetCard(0x2016) and c:IsAbleToRemoveAsCost()
end
function c15609017.desfilter(c)
	return c:IsDestructable()
end
function c15609017.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c15609017.costfilter,tp,LOCATION_GRAVE,0,1,nil) end
	local dg=Duel.GetMatchingGroup(c15609017.desfilter,tp,LOCATION_ONFIELD,LOCATION_ONFIELD,e:GetHandler())
	local gct=dg:GetCount()
	if gct>2 then gct=2 end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
	local g=Duel.SelectMatchingCard(tp,c15609017.costfilter,tp,LOCATION_GRAVE,0,1,gct,nil)
	ct=g:GetCount()
	e:SetLabel(ct)
	Duel.Remove(g,POS_FACEUP,REASON_COST)
end
function c15609017.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	local ct=e:GetLabel()
	if chkc then return chkc:IsOnField() and chkc:IsDestructable() and chkc~=e:GetHandler() end
	if chk==0 then return Duel.IsExistingTarget(Card.IsDestructable,tp,LOCATION_ONFIELD,LOCATION_ONFIELD,1,e:GetHandler()) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_DESTROY)
	local g=Duel.SelectTarget(tp,Card.IsDestructable,tp,LOCATION_ONFIELD,LOCATION_ONFIELD,ct,ct,e:GetHandler())
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,g,1,0,0)
end
function c15609017.activate(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS):Filter(Card.IsRelateToEffect,nil,e)
	Duel.Destroy(g,REASON_EFFECT)
end
