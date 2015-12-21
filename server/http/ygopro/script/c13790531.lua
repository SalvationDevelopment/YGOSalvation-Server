--Igknight Stinger
function c13790531.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DESTROY)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetRange(LOCATION_HAND)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetTarget(c13790531.target)
	e1:SetOperation(c13790531.activate)
	c:RegisterEffect(e1)
	--Activate
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_TOHAND)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetRange(LOCATION_MZONE)
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e2:SetCountLimit(1)
	e2:SetTarget(c13790531.target2)
	e2:SetOperation(c13790531.activate2)
	c:RegisterEffect(e2)
end
function c13790531.filter(c)
	return c:IsFaceup() and c:IsSetCard(0xc6)
end
function c13790531.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsOnField() and c13790531.filter(chkc) and chkc~=e:GetHandler() end
	if chk==0 then return Duel.IsExistingTarget(c13790531.filter,tp,LOCATION_ONFIELD,LOCATION_ONFIELD,3,e:GetHandler()) and
	Duel.GetLocationCount(tp,LOCATION_MZONE)>-1 and e:GetHandler():IsCanBeSpecialSummoned(e,0,tp,false,false) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_DESTROY)
	local g=Duel.SelectTarget(tp,c13790531.filter,tp,LOCATION_ONFIELD,LOCATION_ONFIELD,3,3,e:GetHandler())
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,g,3,0,0)
end
function c13790531.activate(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS)
	if not g then return end
	local sg=g:Filter(Card.IsRelateToEffect,nil,e)
	if sg:GetCount()~=3 then return false end
	if Duel.Destroy(g,REASON_EFFECT) then
		Duel.SpecialSummon(e:GetHandler(),0,tp,tp,false,false,POS_FACEUP)
	end
end

function c13790531.target2(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and chkc:IsAbleToHand() end
	if chk==0 then return Duel.IsExistingTarget(c13790531.filter,tp,LOCATION_MZONE,0,1,nil) 
	and Duel.IsExistingTarget(Card.IsAbletoDeck,tp,0,LOCATION_MZONE,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_RTOHAND)
	local g=Duel.SelectTarget(tp,c13790531.filter,tp,LOCATION_MZONE,0,1,1,e:GetHandler())
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,g,1,0,0)
end
function c13790531.activate2(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc and tc:IsRelateToEffect(e) and Duel.SendtoHand(tc,nil,REASON_EFFECT) then
		local dg=Duel.GetMatchingGroup(Card.IsAbletoHand,tp,0,LOCATION_MZONE,nil)
			Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_DESTROY)
			local des=dg:Select(tp,1,1,nil)
			Duel.HintSelection(des)
			Duel.BreakEffect()
			Duel.SendtoDeck(des,nil,1,REASON_EFFECT)
	end
end
