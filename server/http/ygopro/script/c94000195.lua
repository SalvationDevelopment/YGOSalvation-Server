--Igknight Dragnov
function c94000195.initial_effect(c)
    --pendulum summon
	aux.AddPendulumProcedure(c)
	--activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	c:RegisterEffect(e1)
	--add
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_DESTROY+CATEGORY_SEARCH+CATEGORY_TOHAND)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetRange(LOCATION_PZONE)
	e2:SetCondition(c94000195.condition)
	e2:SetTarget(c94000195.target)
	e2:SetOperation(c94000195.operation)
	c:RegisterEffect(e2)
end
function c94000195.condition(e,tp,eg,ep,ev,re,r,rp)
    local seq=e:GetHandler():GetSequence()
	if Duel.GetFieldCard(tp,LOCATION_SZONE,13-seq)==nil then return false end 
	return Duel.GetFieldCard(tp,LOCATION_SZONE,13-seq):IsSetCard(0x24b9)
end
function c94000195.filter1(c)
    return c:GetSequence()==6 and c:IsDestructable()
end
function c94000195.filter2(c)
    return c:GetSequence()==7 and c:IsDestructable()
end
function c94000195.addfilter(c)
    return c:IsRace(RACE_WARRIOR) and c:IsAttribute(ATTRIBUTE_FIRE) and c:IsAbleToHand()
end
function c94000195.target(e,tp,eg,ep,ev,re,r,rp,chk)
    if chk==0 then return Duel.IsExistingMatchingCard(c94000195.addfilter,tp,LOCATION_DECK+LOCATION_GRAVE,0,1,nil) 
	    and Duel.IsExistingMatchingCard(c94000195.filter1,tp,LOCATION_ONFIELD,0,1,nil)
		and Duel.IsExistingMatchingCard(c94000195.filter2,tp,LOCATION_ONFIELD,0,1,nil) end 
	local g1=Duel.GetMatchingGroup(c94000195.filter1,tp,LOCATION_ONFIELD,0,nil)
	local g2=Duel.GetMatchingGroup(c94000195.filter2,tp,LOCATION_ONFIELD,0,nil)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,g1,1,0,0)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,g2,1,0,0)
	Duel.SetOperationInfo(0,CATEGORY_SEARCH,nil,1,tp,LOCATION_DECK)
end
function c94000195.filter3(c)
    return (c:GetSequence()==6 or c:GetSequence()==7) and c:IsDestructable()
end
function c94000195.operation(e,tp,eg,ep,ev,re,r,rp)
    local g=Duel.GetMatchingGroup(c94000195.filter3,tp,LOCATION_ONFIELD,0,nil)
    if Duel.GetMatchingGroupCount(c94000195.filter3,tp,LOCATION_ONFIELD,0,nil)>0 and Duel.Destroy(g,REASON_EFFECT)==2 then 
	    Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
		local tc=Duel.SelectMatchingCard(tp,c94000195.addfilter,tp,LOCATION_DECK+LOCATION_GRAVE,0,1,1,nil)
		if tc:GetCount()>0 then 
		    Duel.SendtoHand(tc,nil,REASON_EFFECT)
		    Duel.ConfirmCards(1-tp,tc)
		end
	end
end