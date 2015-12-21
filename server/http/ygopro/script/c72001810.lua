--Priestess with Eyes of Blue
function c72001810.initial_effect(c)
	--summon
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(72001810,0))
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetRange(LOCATION_GRAVE)
	e1:SetCountLimit(1,72001810)
	e1:SetTarget(c72001810.sptg)
	e1:SetOperation(c72001810.spop)
	c:RegisterEffect(e1)
	--target
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(72001810,1))
	e2:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e2:SetType(EFFECT_TYPE_QUICK_O)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCode(EVENT_BECOME_TARGET)
	e2:SetCountLimit(1,72001810)
	e2:SetCost(c72001810.thcost)
	e2:SetCondition(c72001810.thcon)
	e2:SetTarget(c72001810.thtg)
	e2:SetOperation(c72001810.thop)
	c:RegisterEffect(e2)
end

function c72001810.thfilter(c)
	return c:IsSetCard(0xd8) and c:IsAbleToHand()
end
function c72001810.thfilter2(c)
	return c:IsType(TYPE_EFFECT) and c:IsAbleToGrave()
end
function c72001810.tdfilter(c)
	return c:IsSetCard(0xd8) and c:IsAbleToDeck()
end
function c72001810.sptg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_GRAVE) and chkc:IsControler(tp) and c72001810.tdfilter(chkc) end
	if chk==0 then return e:GetHandler():IsCanBeSpecialSummoned(e,0,tp,false,false)
		and Duel.IsExistingTarget(c72001810.tdfilter,tp,LOCATION_MZONE,0,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TODECK)
	local g=Duel.SelectTarget(tp,c72001810.tdfilter,tp,LOCATION_MZONE,0,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_TODECK,g,1,0,0)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,e:GetHandler(),1,0,0)
end
function c72001810.spop(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetFieldGroupCount(tp,LOCATION_DECK,0)==0 then return end
	local tc=Duel.GetFirstTarget()
	local c=e:GetHandler()
	if tc:IsRelateToEffect(e) and Duel.SendtoDeck(tc,nil,2,REASON_EFFECT)~=0
		and tc:IsLocation(LOCATION_DECK+LOCATION_EXTRA) and c:IsRelateToEffect(e) then
		Duel.SpecialSummon(c,0,tp,tp,false,false,POS_FACEUP)
	end
end
function c72001810.thcost(e,tp,eg,ep,ev,re,r,rp,chk)
	e:SetLabel(100)
	return true
end
function c72001810.thcon(e,tp,eg,ep,ev,re,r,rp)
	return eg:IsContains(e:GetHandler())
end
function c72001810.thtg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then 
		if e:GetLabel()~=100 then return false end
		e:SetLabel(0)
		return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingMatchingCard(c72001810.thfilter,tp,LOCATION_HAND+LOCATION_DECK+LOCATION_GRAVE,0,1,nil) 
		and Duel.IsExistingMatchingCard(c72001810.thfilter2,tp,LOCATION_MZONE,0,1,nil) end
	Duel.SetOperationInfo(0,CATEGORY_TOGRAVE,nil,1,tp,0)
end
function c72001810.thop(e,tp,eg,ep,ev,re,r,rp)
	local gv=Duel.SelectMatchingCard(tp,c72001810.thfilter2,tp,LOCATION_MZONE,0,1,1,nil)
	if Duel.SendtoGrave(gv,REASON_EFFECT)~=0 then
		local rg=Duel.GetMatchingGroup(c72001810.thfilter,tp,LOCATION_DECK,0,nil)
		local g=Group.CreateGroup()
		local tc=rg:GetFirst()
		local ct=0
		while tc and ct~=2 do 
			Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
			local sc=rg:Select(tp,1,1,nil):GetFirst()
			g:AddCard(sc)
			ct=ct+1
			tc=rg:GetNext()
			rg:Remove(Card.IsCode,nil,sc:GetCode())
			if ct==2 or rg:GetCount()==0 or not Duel.SelectYesNo(tp,aux.Stringid(72001810,0)) then ct=2 end
		end
		if g:GetCount()>0 then
			Duel.SendtoHand(g,nil,REASON_EFFECT)
			Duel.ConfirmCards(1-tp,g)
		end
	end
end