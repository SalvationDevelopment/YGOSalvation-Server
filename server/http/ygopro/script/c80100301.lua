--Merlin
function c80100301.initial_effect(c)
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCountLimit(1,80100301)
	e1:SetCost(c80100301.sscost)
	e1:SetTarget(c80100301.sstg)
	e1:SetOperation(c80100301.ssop)
	c:RegisterEffect(e1)
	--xyz
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(80100301,0))
	e2:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e2:SetType(EFFECT_TYPE_QUICK_O)
	e2:SetCode(EVENT_FREE_CHAIN)
	e2:SetRange(LOCATION_GRAVE)
	e2:SetCountLimit(1,80100302)
	e2:SetCost(c80100301.sccost)
	e2:SetTarget(c80100301.sptg)
	e2:SetOperation(c80100301.spop)
	c:RegisterEffect(e2)
	--synchro
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(80100301,1))
	e3:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e3:SetType(EFFECT_TYPE_QUICK_O)
	e3:SetCode(EVENT_FREE_CHAIN)
	e3:SetRange(LOCATION_GRAVE)
	e3:SetCountLimit(1,80100303)
	e3:SetCost(c80100301.sccost)
	e3:SetTarget(c80100301.sctg)
	e3:SetOperation(c80100301.scop)
	c:RegisterEffect(e3)
	if not c80100301.global_check then
		c80100301.global_check=true
		local ge1=Effect.CreateEffect(c)
		ge1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
		ge1:SetCode(EVENT_SPSUMMON_SUCCESS)
		ge1:SetOperation(c80100301.checkop)
		Duel.RegisterEffect(ge1,0)
	end
end
function c80100301.checkop(e,tp,eg,ep,ev,re,r,rp)
	local tc=eg:GetFirst()
	local p1=false
	local p2=false
	while tc do
		if not tc:IsSetCard(0x107a) then
			if tc:GetSummonPlayer()==0 then p1=true else p2=true end
		end
		tc=eg:GetNext()
	end
	if p1 then Duel.RegisterFlagEffect(0,80100301,RESET_PHASE+PHASE_END,0,1) end
	if p2 then Duel.RegisterFlagEffect(1,80100301,RESET_PHASE+PHASE_END,0,1) end
end
function c80100301.sscost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():IsReleasable() and Duel.GetFlagEffect(tp,80100301)==0 end
	Duel.Release(e:GetHandler(),REASON_COST)
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_CANNOT_SPECIAL_SUMMON)
	e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET+EFFECT_FLAG_OATH)
	e1:SetTargetRange(1,0)
	e1:SetTarget(c80100301.splimit)
	e1:SetReset(RESET_PHASE+PHASE_END)
	Duel.RegisterEffect(e1,tp)
end
function c80100301.splimit(e,c,tp,sumtp,sumpos)
	return not c:IsSetCard(0x107a)
end
function c80100301.filter(c,e,tp)
	return c:IsSetCard(0x107a)  and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c80100301.sstg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>-1
		and Duel.IsExistingMatchingCard(c80100301.filter,tp,LOCATION_DECK,0,1,nil,e,tp) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_DECK)
end
function c80100301.ssop(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectMatchingCard(tp,c80100301.filter,tp,LOCATION_DECK,0,1,1,nil,e,tp)
	Duel.SpecialSummon(g,0,tp,tp,false,false,POS_FACEUP)
end
function c80100301.sccost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():IsAbleToRemoveAsCost() end
	Duel.Hint(HINT_OPSELECTED,1-tp,e:GetDescription())
	Duel.Remove(e:GetHandler(),POS_FACEUP,REASON_COST)
end
function c80100301.xyzmfilter(c)
	return c:IsFaceup() and not c:IsType(TYPE_XYZ) and not c:IsType(TYPE_TOKEN)
end

function c80100301.xyzfilter(c,mg)
	return c:IsSetCard(0x107a) and c:IsXyzSummonable(mg)
end
function c80100301.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then
		local g=Duel.GetMatchingGroup(c80100301.xyzmfilter,tp,LOCATION_MZONE,0,nil)
		return Duel.IsExistingMatchingCard(c80100301.xyzfilter,tp,LOCATION_EXTRA,0,1,nil,g)
	end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_EXTRA)
end
function c80100301.spop(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetMatchingGroup(c80100301.xyzmfilter,tp,LOCATION_MZONE,0,nil)
	local xyzg=Duel.GetMatchingGroup(c80100301.xyzfilter,tp,LOCATION_EXTRA,0,nil,g)
	if xyzg:GetCount()>0 then
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
		local xyz=xyzg:Select(tp,1,1,nil):GetFirst()
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_XMATERIAL)
		local sg=g:FilterSelect(tp,xyz.xyz_filter,xyz.xyz_count,xyz.xyz_count,nil)
		Duel.XyzSummon(tp,xyz,sg)
	end
end

function c80100301.mfilter(c)
	return c:IsFaceup()
end
function c80100301.cfilter(c,syn)
	return syn:IsSynchroSummonable(c) and c:IsSetCard(0x107a)
end
function c80100301.spfilter(c,mg)
	return mg:IsExists(c80100301.cfilter,1,nil,c)
end
function c80100301.sctg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then
		local mg=Duel.GetMatchingGroup(c80100301.mfilter,tp,LOCATION_MZONE,0,nil)
		return Duel.IsExistingMatchingCard(c80100301.spfilter,tp,LOCATION_EXTRA,0,1,nil,mg)
	end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_EXTRA)
end
function c80100301.scop(e,tp,eg,ep,ev,re,r,rp)
	local mg=Duel.GetMatchingGroup(c80100301.mfilter,tp,LOCATION_MZONE,0,nil)
	local g=Duel.GetMatchingGroup(c80100301.spfilter,tp,LOCATION_EXTRA,0,nil,mg)
	if g:GetCount()>0 then
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
		local sg=g:Select(tp,1,1,nil)
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SMATERIAL)
		local tg=mg:FilterSelect(tp,c80100301.cfilter,1,1,nil,sg:GetFirst())
		Duel.SynchroSummon(tp,sg:GetFirst(),tg:GetFirst())
	end
end
