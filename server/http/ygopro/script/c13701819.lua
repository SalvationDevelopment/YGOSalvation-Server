--True Name
function c13701819.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCountLimit(1,13701819)
	e1:SetTarget(c13701819.target)
	e1:SetOperation(c13701819.activate)
	c:RegisterEffect(e1)
end
function c13701819.filter(c,ft,e,tp)
	return c:IsAttribute(ATTRIBUTE_DEVINE)
		and (c:IsAbleToHand() or (ft>0 and c:IsCanBeSpecialSummoned(e,0,tp,false,false)))
end
function c13701819.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(Card.IsAbleToHand,tp,LOCATION_DECK,0,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,0)
	local ac=Duel.AnnounceCard(tp)
	Duel.SetTargetParam(ac)
	Duel.SetOperationInfo(0,CATEGORY_ANNOUNCE,nil,0,tp,ANNOUNCE_CARD)
end
function c13701819.activate(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetFieldGroupCount(tp,LOCATION_DECK,0)==0 then return end
	Duel.ConfirmDecktop(tp,1)
	local g=Duel.GetDecktopGroup(tp,1)
	local tc=g:GetFirst()
	local ac=Duel.GetChainInfo(0,CHAININFO_TARGET_PARAM)
	if tc:IsCode(ac) and tc:IsAbleToHand() then
		Duel.DisableShuffleCheck()
		Duel.SendtoHand(tc,nil,REASON_EFFECT)
		Duel.ShuffleHand(tp)
		
		local ft=Duel.GetLocationCount(tp,LOCATION_MZONE)
		if Duel.IsExistingMatchingCard(c13701819.filter,tp,LOCATION_DECK,0,1,nil,ft,e,tp) then
			if Duel.SelectYesNo(tp,aux.Stringid(13701819,0)) then
				Duel.Hint(HINT_SELECTMSG,tp,0)
				local g=Duel.SelectMatchingCard(tp,c13701819.filter,tp,LOCATION_DECK,0,1,1,nil,ft,e,tp)
				if g:GetCount()>0 then
					local th=g:GetFirst():IsAbleToHand()
					local sp=ft>0 and g:GetFirst():IsCanBeSpecialSummoned(e,0,tp,false,false)
					local op=0
					if th and sp then op=Duel.SelectOption(tp,aux.Stringid(20065322,0),aux.Stringid(20065322,1))
					elseif th then op=0
					else op=1 end
					if op==0 then
						Duel.SendtoHand(g,nil,REASON_EFFECT)
						Duel.ConfirmCards(1-tp,g)
						Duel.ShuffleDeck(tp)
					else
						Duel.SpecialSummon(g,0,tp,tp,false,false,POS_FACEUP)
						Duel.ShuffleDeck(tp)
					end
				end
			end
		end
	else
		Duel.DisableShuffleCheck()
		Duel.SendtoGrave(tc,nil,REASON_EFFECT)
	end
end

