--Super Quantum Mecha Ship Magnacarrier
--Scripted by Ragna_Edge
function c10424147.initial_effect(c)
	--activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	c:RegisterEffect(e1)
	--spsummon
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(10424147,1))
	e2:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e2:SetRange(LOCATION_FZONE)
	e2:SetCost(c10424147.spcost)
	e2:SetTarget(c10424147.sptg)
	e2:SetOperation(c10424147.spop)
	c:RegisterEffect(e2)
	-- Go GO Power Rangers
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(10424147,2))
	e3:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e3:SetType(EFFECT_TYPE_IGNITION)
	e3:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e3:SetRange(LOCATION_FZONE)
	e3:SetTarget(c10424147.target)
	e3:SetOperation(c10424147.activate)
	c:RegisterEffect(e3)
end
function c10424147.spcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(Card.IsDiscardable,tp,LOCATION_HAND,0,1,nil) end
	Duel.DiscardHand(tp,Card.IsDiscardable,1,1,REASON_DISCARD+REASON_COST,nil)
end
function c10424147.filter1(c,e,tp)
	return c:IsFaceup() and c:IsSetCard(0x10d5)
		and Duel.IsExistingMatchingCard(c10424147.filter2,tp,LOCATION_EXTRA,0,1,nil,e,tp,c,c:GetAttribute())
end
function c10424147.filter2(c,e,tp,mc,att)
	return c:IsType(TYPE_XYZ) and c:IsSetCard(0x20d5) and c:IsAttribute(att) and mc:IsCanBeXyzMaterial(c)
		and c:IsCanBeSpecialSummoned(e,SUMMON_TYPE_XYZ,tp,false,false)
end
function c10424147.sptg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsControler(tp) and chkc:IsLocation(LOCATION_MZONE) and c10424147.filter1(chkc,e,tp) end
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>-1
		and Duel.IsExistingTarget(c10424147.filter1,tp,LOCATION_MZONE,0,1,nil,e,tp) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TARGET)
	Duel.SelectTarget(tp,c10424147.filter1,tp,LOCATION_MZONE,0,1,1,nil,e,tp)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_EXTRA)
end
function c10424147.spop(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<0 then return end
	local tc=Duel.GetFirstTarget()
	if tc:IsFacedown() or not tc:IsRelateToEffect(e) or tc:IsControler(1-tp) or tc:IsImmuneToEffect(e) then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectMatchingCard(tp,c10424147.filter2,tp,LOCATION_EXTRA,0,1,1,nil,e,tp,tc,tc:GetAttribute())
	local sc=g:GetFirst()
	if sc then
		local cg=Group.FromCards(tc)
		sc:SetMaterial(cg)
		Duel.Overlay(sc,cg)
		Duel.SpecialSummon(sc,SUMMON_TYPE_XYZ,tp,tp,false,false,POS_FACEUP)
		sc:CompleteProcedure()
	end
end
function c10424147.filter(c)
	return c:IsSetCard(0x20d5) and c:IsType(TYPE_XYZ)
end
function c10424147.spfilter(c,e,tp)
	return c:IsCode(84025439) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c10424147.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
		local mg=Duel.GetMatchingGroup(c10424147.filter,tp,LOCATION_MZONE+LOCATION_GRAVE,0,nil,e,tp)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingTarget(c10424147.filter,tp,LOCATION_MZONE+LOCATION_GRAVE,0,3,nil)
		and Duel.IsExistingMatchingCard(c10424147.spfilter,tp,LOCATION_EXTRA,0,1,nil,e,tp) 
		and e:GetHandler():IsAbleToGrave()
		and mg:GetClassCount(Card.GetCode)>=3 end
	Duel.SendtoGrave(e:GetHandler(),REASON_EFFECT)
	local g=Duel.GetMatchingGroup(c10424147.filter,tp,LOCATION_MZONE+LOCATION_GRAVE,0,nil,e,tp)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>2
		and g:GetClassCount(Card.GetCode)>=3 end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g1=g:Select(tp,1,1,nil)
	g:Remove(Card.IsCode,nil,g1:GetFirst():GetCode())
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g2=g:Select(tp,1,1,nil)
	g:Remove(Card.IsCode,nil,g2:GetFirst():GetCode())
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g3=g:Select(tp,1,1,nil)
	g1:Merge(g2)
	g1:Merge(g3)
	Duel.SetTargetCard(g1)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_EXTRA)
end
function c10424147.activate(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
	local g=Duel.GetMatchingGroup(c10424147.spfilter,tp,LOCATION_EXTRA,0,nil,e,tp)
	if g:GetCount()==0 then return end
	local gs=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS):Filter(Card.IsRelateToEffect,nil,e)
	if gs:GetCount()~=3 then return end
	local tc1=gs:GetFirst()
	local tc2=gs:GetNext()
	local tc3=gs:GetNext()
	if tc1:IsRelateToEffect(e) and tc2:IsRelateToEffect(e) and tc3:IsRelateToEffect(e) then
			local og1=tc1:GetOverlayGroup()
			local og2=tc2:GetOverlayGroup()
			local og3=tc3:GetOverlayGroup()
			og1:Merge(og2)
			og1:Merge(og3)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local sg=g:Select(tp,1,1,nil)
	local sc=sg:GetFirst()
	if sc and Duel.SpecialSummon(sc,0,tp,tp,false,false,POS_FACEUP) then
		if og1:GetCount()>0 then
			Duel.Overlay(sc,og1)
		end
		Duel.Overlay(sc,gs)
		sc:CompleteProcedure()
	end
end
end
