--Igknight Avenger
function c94000192.initial_effect(c)
    --spsummon
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DESTROY+CATEGORY_SPECIAL_SUMMON)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetRange(LOCATION_HAND)
	e1:SetTarget(c94000192.sptg)
	e1:SetOperation(c94000192.spop)
	c:RegisterEffect(e1)
	--todeck
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_TODECK+CATEGORY_TOHAND)
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCountLimit(1)
	e2:SetTarget(c94000192.tg)
	e2:SetOperation(c94000192.op)
	c:RegisterEffect(e2)
end
function c94000192.filter(c)
    return c:IsSetCard(0x24b9) and c:IsDestructable()
end
function c94000192.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
    if chk==0 then return Duel.IsExistingTarget(c94000192.filter,tp,LOCATION_ONFIELD,0,3,nil) 
	    and e:GetHandler():IsCanBeSpecialSummoned(e,0,tp,false,false) end 
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_DESTROY)
	local g=Duel.SelectTarget(tp,c94000192.filter,tp,LOCATION_ONFIELD,0,3,3,nil)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,g,g:GetCount(),0,0)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,e:GetHandler(),1,0,0)
end
function c94000192.spop(e,tp,eg,ep,ev,re,r,rp)
    if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return false end
    local g=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS)
	local tc=g:Filter(Card.IsRelateToEffect,nil,e)
	if tc:GetCount()>0 and Duel.Destroy(tc,REASON_EFFECT)~=0 then 
        Duel.SpecialSummon(e:GetHandler(),0,tp,tp,false,false,POS_FACEUP)
	end
end
function c94000192.filter2(c)
    return c:IsSetCard(0x24b9) and c:IsAbleToHand()
end
function c94000192.tdfilter(c)
    return c:IsType(TYPE_SPELL+TYPE_TRAP) and c:IsAbleToDeck()
end
function c94000192.tg(e,tp,eg,ep,ev,re,r,rp,chk)
    if chk==0 then return Duel.IsExistingTarget(c94000192.filter2,tp,LOCATION_MZONE,0,1,e:GetHandler())
        and Duel.IsExistingMatchingCard(c94000192.tdfilter,tp,0,LOCATION_ONFIELD,1,nil)	end 
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_RTOHAND)
	local g1=Duel.SelectTarget(tp,c94000192.filter2,tp,LOCATION_MZONE,0,1,1,e:GetHandler())
	local g2=Duel.GetMatchingGroup(c94000192.tdfilter,tp,0,LOCATION_ONFIELD,nil)
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,g1,1,0,0)
	Duel.SetOperationInfo(0,CATEGORY_TODECK,g2,1,0,0)
end
function c94000192.op(e,tp,eg,ep,ev,re,r,rp)
    local tc=Duel.GetFirstTarget()
	if not tc:IsRelateToEffect(e) then return end  
	if Duel.SendtoHand(tc,nil,REASON_EFFECT)~=0 and Duel.IsExistingMatchingCard(c94000192.tdfilter,tp,0,LOCATION_ONFIELD,1,nil) then 
	    Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TODECK)
		local g=Duel.SelectMatchingCard(tp,c94000192.tdfilter,tp,0,LOCATION_ONFIELD,1,1,nil)
		Duel.SendtoDeck(g,nil,1,REASON_EFFECT)
	end
end