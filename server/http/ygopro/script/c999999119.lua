--Dragon's Mausoleum
function c999999119.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_TOGRAVE)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCost(c999999119.cost)
	e1:SetTarget(c999999119.target)
	e1:SetOperation(c999999119.activate)
	c:RegisterEffect(e1)
end
function c999999119.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFlagEffect(tp,999999119)==0 end
	Duel.RegisterFlagEffect(tp,999999119,RESET_PHASE+PHASE_END,0,1)
end

function c999999119.tgfilter(c)
	return c:IsRace(RACE_DRAGON) and c:IsAbleToGrave()
end
function c999999119.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c999999119.tgfilter,tp,LOCATION_DECK,0,1,nil) end
	Duel.SetOperationInfo(0,CATEGORY_TOGRAVE,nil,1,tp,LOCATION_DECK)
end
function c999999119.activate(e,tp,eg,ep,ev,re,r,rp)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	local g=Duel.SelectMatchingCard(tp,c999999119.tgfilter,tp,LOCATION_DECK,0,1,1,nil)
	if g:GetCount()>0 then
		if Duel.SendtoGrave(g,REASON_EFFECT) and 
		g:GetFirst():IsType(TYPE_NORMAL) and
		Duel.SelectYesNo(tp,aux.Stringid(999999119,0))
		then
			Duel.BreakEffect()
			Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
			local g2=Duel.SelectMatchingCard(tp,c999999119.tgfilter,tp,LOCATION_DECK,0,1,1,nil)
			Duel.SendtoGrave(g2,REASON_EFFECT)
		end
	end
end
