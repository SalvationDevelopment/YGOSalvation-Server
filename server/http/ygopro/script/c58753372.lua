--Super Quantum Fairy Alphan
--Scripted by Ragna_Edge
function c58753372.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(58753372,1))
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCountLimit(1)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetTarget(c58753372.target)
	e1:SetOperation(c58753372.activate)
	c:RegisterEffect(e1)
	local e2=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(58753372,2))
	e2:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetCountLimit(1,58753372)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCost(c58753372.spcost)
	e2:SetTarget(c58753372.sptg)
	e2:SetOperation(c58753372.spop)
	c:RegisterEffect(e2)
end
function c58753372.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and chkc:IsControler(tp) and c58753372.tfilter(chkc,tp) end
	if chk==0 then return Duel.IsExistingTarget(c58753372.tfilter,tp,LOCATION_MZONE,0,1,nil,tp) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_FACEUP)
	Duel.SelectTarget(tp,c58753372.tfilter,tp,LOCATION_MZONE,0,1,1,nil,tp)
end
function c58753372.filter(c)
	return c:IsFaceup() and c:GetLevel()>0
end
function c58753372.tfilter(c,e)
	return c:IsFaceup() and c:GetLevel()>0 and c:IsSetCard(0xd5)
end
function c58753372.activate(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsFaceup() and tc:IsRelateToEffect(e) then
		local g=Duel.GetMatchingGroup(c58753372.filter,tp,LOCATION_MZONE,0,tc)
		local lc=g:GetFirst()
		while lc do
			local e1=Effect.CreateEffect(e:GetHandler())
			e1:SetType(EFFECT_TYPE_SINGLE)
			e1:SetCode(EFFECT_CHANGE_LEVEL_FINAL)
			e1:SetValue(tc:GetLevel())
			e1:SetReset(RESET_EVENT+0x1fe0000)
			lc:RegisterEffect(e1)
			lc=g:GetNext()
		end
	end
end
function c58753372.filter1(c,e,tp,sc)
	return c:IsSetCard(sc) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c58753372.spcost(e,tp,eg,ep,ev,re,r,rp,chk)
	local c=e:GetHandler()
	if chk==0 then return c:IsReleasable() end
	Duel.Release(c,REASON_COST)
end
function c58753372.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then
		local g=Duel.GetMatchingGroup(c58753372.filter1,tp,LOCATION_DECK,0,nil,e,tp,0xd5)
		return g:GetClassCount(Card.GetCode)>=3
	end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,0,LOCATION_DECK)
end
function c58753372.spop(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetMatchingGroup(c58753372.filter1,tp,LOCATION_DECK,0,nil,e,tp,0xd5)
	if g:GetClassCount(Card.GetCode)>=3 then
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_CONFIRM)
		local sg1=g:Select(tp,1,1,nil)
		g:Remove(Card.IsCode,nil,sg1:GetFirst():GetCode())
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_CONFIRM)
		local sg2=g:Select(tp,1,1,nil)
		g:Remove(Card.IsCode,nil,sg2:GetFirst():GetCode())
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_CONFIRM)
		local sg3=g:Select(tp,1,1,nil)
		sg1:Merge(sg2)
		sg1:Merge(sg3)
		Duel.ConfirmCards(1-tp,sg1)
		Duel.ShuffleDeck(tp)
		Duel.Hint(HINT_SELECTMSG,1-tp,HINTMSG_ATOHAND)
		local tg=sg1:Select(1-tp,1,1,nil)
		local tc=tg:GetFirst()
		if tc:IsCanBeSpecialSummoned(e,0,tp,false,false) then
			Duel.SpecialSummon(tc,0,tp,tp,false,false,POS_FACEUP)
			sg1:RemoveCard(tc)
		else
			Duel.SendtoGrave(tc,REASON_EFFECT)
			sg1:RemoveCard(tc)
		end
		Duel.SendtoGrave(sg1,REASON_EFFECT)
	end
end
