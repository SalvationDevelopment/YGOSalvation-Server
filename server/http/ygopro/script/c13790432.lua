--Oracle of the Zefra
function c13790432.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_TOHAND+CATEGORY_SEARCH)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCountLimit(1,13790432)
	e1:SetOperation(c13790432.activate)
	c:RegisterEffect(e1)
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e2:SetProperty(EFFECT_FLAG_DELAY)
	e2:SetRange(LOCATION_SZONE)
	e2:SetCode(EVENT_BE_MATERIAL)
	e2:SetCondition(c13790432.spcon)
	e2:SetTarget(c13790432.sptg)
	e2:SetOperation(c13790432.spop)
	c:RegisterEffect(e2)
end
function c13790432.filter(c)
	return c:IsSetCard(0xc3) and c:IsType(TYPE_MONSTER) and c:IsAbleToHand()
end
function c13790432.activate(e,tp,eg,ep,ev,re,r,rp)
	if not e:GetHandler():IsRelateToEffect(e) then return end
	local g=Duel.GetMatchingGroup(c13790432.filter,tp,LOCATION_DECK,0,nil)
	if g:GetCount()>0 and Duel.SelectYesNo(tp,aux.Stringid(13790432,0)) then
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
		local sg=g:Select(tp,1,1,nil)
		Duel.SendtoHand(sg,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,sg)
	end
end
function c13790432.filter2(c)
	return c:IsSetCard(0xc3) and c:IsType(TYPE_MONSTER)
end
function c13790432.spfilter(c,e,tp)
	return c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c13790432.spcon(e,tp,eg,ep,ev,re,r,rp)
	return eg:IsExists(c13790432.filter2,1,nil) and (r==REASON_SYNCHRO or r==REASON_XYZ or r==REASON_FUSION or r==REASON_RITUAL)
end
function c13790432.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if tp~=Duel.GetTurnPlayer() then return false end
	if r==REASON_FUSION and e:GetHandler():GetFlagEffect(137904321)==0 then 
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingMatchingCard(c13790432.spfilter,tp,LOCATION_HAND,0,1,nil,e,tp) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_HAND)
	end
	if r==REASON_XYZ and e:GetHandler():GetFlagEffect(137904322)==0 then 
	if chk==0 then return Duel.IsPlayerCanDraw(tp,1) end
	Duel.SetOperationInfo(0,CATEGORY_HANDES,nil,0,tp,1)
	Duel.SetOperationInfo(0,CATEGORY_DRAW,nil,0,tp,1)
	end
	if r==REASON_SYNCHRO and e:GetHandler():GetFlagEffect(137904323)==0 then 
	if chk==0 then return Duel.IsExistingMatchingCard(Card.IsType,tp,LOCATION_DECK,0,1,nil,TYPE_MONSTER) end
	end
	if r==REASON_RITUAL and e:GetHandler():GetFlagEffect(137904324)==0 then 
		if chkc then return chkc:GetLocation()==LOCATION_MZONE and chkc:IsAbleToDeck() end
	if chk==0 then return true end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_RTOHAND)
	local g=Duel.SelectTarget(tp,Card.IsAbleToDeck,tp,LOCATION_MZONE,LOCATION_MZONE,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,g,g:GetCount(),0,0)
	end
end
function c13790432.spop(e,tp,eg,ep,ev,re,r,rp)
	if r==REASON_FUSION then
		if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
		local g=Duel.SelectMatchingCard(tp,c13790432.spfilter,tp,LOCATION_HAND,0,1,1,nil,e,tp)
		local tc=g:GetFirst()
		if tc then
			Duel.SpecialSummon(tc,0,tp,tp,false,false,POS_FACEUP)
		end
	e:GetHandler():RegisterFlagEffect(137904321,RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END,0,1)
	end
	if r==REASON_XYZ then 
		Duel.Draw(tp,1,REASON_EFFECT)
		Duel.DiscardHand(tp,aux.TRUE,1,1,REASON_EFFECT+REASON_DISCARD)
	e:GetHandler():RegisterFlagEffect(137904322,RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END,0,1)	
	end
	if r==REASON_SYNCHRO then 
		Duel.Hint(HINT_SELECTMSG,tp,aux.Stringid(17559367,1))
		local g=Duel.SelectMatchingCard(tp,Card.IsType,tp,LOCATION_DECK,0,1,1,nil,TYPE_MONSTER)
		local tc=g:GetFirst()
		if tc then
			Duel.ShuffleDeck(tp)
			Duel.MoveSequence(tc,0)
			Duel.ConfirmDecktop(tp,1)
		end
	e:GetHandler():RegisterFlagEffect(137904323,RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END,0,1)
	end
	if r==REASON_RITUAL then 
	local tc=Duel.GetFirstTarget()
	if tc and tc:IsRelateToEffect(e) then
		Duel.SendtoDeck(tc,nil,2,REASON_EFFECT)
		end
	e:GetHandler():RegisterFlagEffect(137904324,RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END,0,1)
	end
end
