--影霊衣の降魔鏡
function c80100121.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCountLimit(1,80100121)
	e1:SetTarget(c80100121.target)
	e1:SetOperation(c80100121.activate)
	c:RegisterEffect(e1)
	--tohand
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(80100121,0))
	e2:SetCategory(CATEGORY_TOHAND+CATEGORY_SEARCH)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetRange(LOCATION_GRAVE)
	e2:SetCondition(c80100121.thcon)
	e2:SetCost(c80100121.thcost)
	e2:SetTarget(c80100121.thtarget)
	e2:SetOperation(c80100121.thoperation)
	c:RegisterEffect(e2)
end
function c80100121.filter(c,e,tp,m)
	return bit.band(c:GetType(),0x81)==0x81 and c:IsCanBeSpecialSummoned(e,SUMMON_TYPE_RITUAL,tp,true,false)
		and m:IsExists(c80100121.filter1,1,nil,c,c:GetLevel())
		and c:IsSetCard(0xb4)
end
function c80100121.filter1(c,sc,lvl)
	return c:GetRitualLevel(sc)==lvl
end
function c80100121.matfilter(c)
	return c:IsSetCard(0xb4) and c:IsAbleToGrave()
end
function c80100121.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then
		if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return false end
		local mg=Duel.GetRitualMaterial(tp)
		local mg1=Duel.GetMatchingGroup(c80100121.matfilter,tp,LOCATION_EXTRA,0,nil)
		mg:Merge(mg1)
		return Duel.IsExistingMatchingCard(c80100121.filter,tp,LOCATION_HAND,0,1,nil,e,tp,mg)
	end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_HAND)
end
function c80100121.activate(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
	local mg=Duel.GetRitualMaterial(tp)
	local mg1=Duel.GetMatchingGroup(c80100121.matfilter,tp,LOCATION_GRAVE,0,nil)
	mg:Merge(mg1)
	local tg=Duel.GetMatchingGroup(c80100121.filter,tp,LOCATION_HAND,0,nil,e,tp,mg)
	local bool=true
	if tg:GetCount()==0 then return end
	while bool do
	
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
		local g1=tg:Select(tp,1,1,nil)
		tg:Sub(g1)
		
		local tc=tg:GetFirst()
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
		local mat=mg:SelectWithSumEqual(tp,Card.GetRitualLevel,tc:GetLevel(),1,1,tc)
		tc:SetMaterial(mat)	
		mg:Sub(mat)		
		
		local mat1=mat:Filter(Card.IsLocation,nil,LOCATION_EXTRA)
		mat:Sub(mat1)
		Duel.ReleaseRitualMaterial(mat)
		Duel.SendtoGrave(mat1,POS_FACEUP,REASON_EFFECT+REASON_MATERIAL+REASON_RITUAL)
		Duel.BreakEffect()
		Duel.SpecialSummon(tc,SUMMON_TYPE_RITUAL,tp,tp,true,false,POS_FACEUP)
		tc:CompleteProcedure()
				
		if mat:GetFirst():IsCode(80100110) then 
			bool=false
			break
		else 
			mg:Remove(Card.IsCode,nil,80100110) 
			tg=Duel.GetMatchingGroup(c80100121.filter,tp,LOCATION_HAND,0,nil,e,tp,mg)
			if tg:GetCount()==0 then return end
			bool=Duel.SelectYesNo(tp,aux.Stringid(80100121,1))	
		end	
	end
end
function c80100121.thcon(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetFieldGroupCount(tp,LOCATION_MZONE,0)==0
end
function c80100121.costfilter(c)
	return c:IsRace(RACE_FIEND) and c:IsAbleToRemoveAsCost()
end
function c80100121.thcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():IsAbleToRemoveAsCost() and
		Duel.IsExistingMatchingCard(c80100121.costfilter,tp,LOCATION_GRAVE,0,1,nil) 
	end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
	local g=Duel.SelectMatchingCard(tp,c80100121.costfilter,tp,LOCATION_GRAVE,0,1,1,nil)
	Duel.Remove(g,POS_FACEUP,REASON_COST)
	Duel.Remove(e:GetHandler(),POS_FACEUP,REASON_COST)
end
function c80100121.thfilter(c)
	return c:IsSetCard(0xb4) and c:IsType(TYPE_SPELL) and c:IsAbleToHand()
end
function c80100121.thtarget(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,nil,1,tp,LOCATION_DECK)
end
function c80100121.thoperation(e,tp,eg,ep,ev,re,r,rp)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
	local g=Duel.SelectMatchingCard(tp,c80100121.thfilter,tp,LOCATION_DECK,0,1,1,nil)
	if g:GetCount()>0 then
		Duel.SendtoHand(g,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,g)
	end
end